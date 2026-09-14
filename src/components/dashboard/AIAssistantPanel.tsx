"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import AvatarOrb from "@/components/ui/AvatarOrb";
import Waveform from "@/components/ui/Waveform";
import RichText from "@/components/chat/RichText";
import SourceBadge from "@/components/chat/SourceBadge";
import { suggestedQuestions } from "@/lib/knowledge";
import type { ChatMessage as MessageType, ChatRequestMessage } from "@/lib/chat";
import { cn } from "@/lib/utils";
import {
  Send,
  Mic,
  MicOff,
  Plus,
  MessageSquare,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Trash2,
} from "lucide-react";
import {
  LANGUAGE_OPTIONS,
  getLanguageByLabel,
  getSpeechRecognitionCtor,
  isSpeechRecognitionSupported,
  speak,
  speakNeural,
  cancelSpeech,
  type SpeechRecognitionLike,
} from "@/lib/voice";

const SESSIONS_KEY = "usdx_ai_sessions";

type SavedSession = {
  id: string;
  title: string;
  updatedAt: number;
  messages: MessageType[];
};

function buildSessionEntry(msgs: MessageType[], id: string): SavedSession {
  const firstUser = msgs.find((m) => m.role === "user");
  return {
    id,
    title: firstUser ? firstUser.content.replace(/\s+/g, " ").slice(0, 48) : "New chat",
    updatedAt: Date.now(),
    messages: msgs,
  };
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AIAssistantPanel() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"chat" | "history">("chat");
  const [language, setLanguage] = useState("English");
  const [langOpen, setLangOpen] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const hasConversation = messages.length > 0;

  useEffect(() => {
    void Promise.resolve().then(() =>
      setSpeechSupported(isSpeechRecognitionSupported())
    );
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => {
      try {
        const raw = window.localStorage.getItem(SESSIONS_KEY);
        if (raw) setSessions(JSON.parse(raw) as SavedSession[]);
      } catch {
        /* ignore */
      }
    });
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const recognition = recognitionRef.current;
    return () => {
      recognition?.stop();
      cancelSpeech();
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    cancelSpeech();
    setSpeakingId(null);
  }, []);

  const toggleSpeak = useCallback(
    async (message: MessageType) => {
      if (speakingId === message.id) {
        stopSpeaking();
        return;
      }
      stopSpeaking();
      const code = getLanguageByLabel(language).voiceCode;
      setSpeakingId(message.id);
      const played = await speakNeural(message.content || "", code);
      if (!played) {
        await speak(message.content || "", code);
      }
      setSpeakingId(null);
    },
    [language, speakingId, stopSpeaking]
  );

  const ask = async (question: string) => {
    const userMsg: MessageType = { id: uuidv4(), role: "user", content: question };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsLoading(true);

    const history: ChatRequestMessage[] = next.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          language: getLanguageByLabel(language).code,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: uuidv4(), role: "assistant", content: data.content, sources: data.sources, unknown: data.unknown },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: uuidv4(), role: "assistant", content: "I couldn't reach the USDX AI service. Please try again in a moment.", sources: [] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    ask(input.trim());
  };

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!speechSupported) {
      alert("Voice input is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    const recognition = new Ctor();
    setMicError(null);
    recognition.lang = getLanguageByLabel(language).code;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim() && !/^[.!?]+$/.test(transcript)) {
        setInput(transcript);
      }
    };

    recognition.onerror = (event) => {
      const code = event.error ?? "unknown";
      const messages: Record<string, string> = {
        "not-allowed":
          "Microphone access was denied. Allow microphone access in your browser and try again.",
        "no-speech":
          "No speech was detected. Click the mic and speak clearly.",
        "audio-capture":
          "No microphone was found on this device. Connect one and try again.",
        "network":
          "Speech recognition is unavailable (network error). Check your connection and retry.",
        "service-not-allowed":
          "Speech recognition is blocked by your browser. Allow it and try again.",
        "language-not-supported":
          "Speech recognition does not support the selected language in this browser.",
      };
      setMicError(messages[code] ?? `Speech recognition failed (${code}).`);
      if (code === "not-allowed") {
        alert(messages[code]);
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setMicError("Could not start the microphone. Try again.");
      setListening(false);
      return;
    }
    setListening(true);
  }, [speechSupported, language]);

  const toggleVoice = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const newChat = () => {
    stopSpeaking();
    stopListening();
    setMicError(null);
    saveSession(messages);
    sessionIdRef.current = null;
    setMessages([]);
  };

  const saveSession = (msgs: MessageType[]) => {
    if (msgs.length === 0) return;
    const id = sessionIdRef.current ?? (sessionIdRef.current = uuidv4());
    const entry = buildSessionEntry(msgs, id);
    setSessions((prev) => {
      const next = [entry, ...prev.filter((s) => s.id !== id)].slice(0, 20);
      try {
        window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  };

  useEffect(() => {
    if (messages.length === 0) return;
    const msgs = messages;
    const t = setTimeout(() => {
      const id = sessionIdRef.current ?? (sessionIdRef.current = uuidv4());
      setSessions((prev) => {
        const entry = buildSessionEntry(msgs, id);
        const next = [entry, ...prev.filter((s) => s.id !== id)].slice(0, 20);
        try {
          window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
        } catch { /* ignore */ }
        return next;
      });
    }, 500);
    return () => clearTimeout(t);
  }, [messages]);

  const openSession = (session: SavedSession) => {
    stopSpeaking();
    stopListening();
    setMicError(null);
    sessionIdRef.current = session.id;
    setMessages(session.messages);
    setTab("chat");
  };

  const deleteSession = (id: string) => {
    if (sessionIdRef.current === id) sessionIdRef.current = null;
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      try {
        window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col rounded-[14px] border border-border-subtle bg-bg-card overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-5 py-3.5">
        <div className="flex items-center gap-3">
          <AvatarOrb size="sm" active={!listening} listening={listening} />
          <div>
            <h2 className="text-[14px] font-bold text-text-primary flex items-center gap-2">
              USDX AI
              <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-[pulseDot_2s_ease-in-out_infinite]" />
                Online
              </span>
            </h2>
            <p className="text-[11px] text-text-muted">Your intelligent USDX assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              className="rounded-[8px] border border-border-subtle bg-bg-elevated px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:border-border-medium hover:text-text-primary"
            >
              {language}
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 rounded-[10px] border border-border-subtle bg-bg-card p-1 shadow-xl z-20 animate-fade-in">
                {LANGUAGE_OPTIONS.map((l) => (
                  <button
                    key={l.label}
                    onClick={() => {
                      setLanguage(l.label);
                      setLangOpen(false);
                      stopSpeaking();
                    }}
                    className={cn(
                      "flex w-full items-center rounded-[6px] px-2.5 py-1.5 text-[11px] transition-colors",
                      l.label === language ? "bg-accent-blue/10 text-accent-blue" : "text-text-secondary hover:bg-bg-elevated"
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={newChat}
            className="flex items-center gap-1.5 rounded-[8px] border border-border-subtle bg-bg-elevated px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:border-border-medium hover:text-text-primary"
          >
            <Plus className="h-3 w-3" />
            New Chat
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 border-b border-border-subtle">
        <button
          type="button"
          onClick={() => setTab("chat")}
          className={cn(
            "flex items-center gap-1.5 px-5 py-2.5 text-[12px] font-medium transition-colors border-b-2 -mb-px",
            tab === "chat"
              ? "border-accent-blue text-accent-blue"
              : "border-transparent text-text-muted hover:text-text-secondary"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Chat
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={cn(
            "flex items-center gap-1.5 px-5 py-2.5 text-[12px] font-medium transition-colors border-b-2 -mb-px",
            tab === "history"
              ? "border-accent-blue text-accent-blue"
              : "border-transparent text-text-muted hover:text-text-secondary"
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          History
        </button>
      </div>

      {/* Content */}
      {tab === "chat" ? (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {hasConversation ? (
            <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-5">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end animate-fade-in-up">
                    <div className="max-w-[80%] rounded-[12px] rounded-tr-[4px] bg-accent-blue/15 border border-accent-blue/20 px-4 py-2.5 text-[13px] leading-relaxed text-text-primary">
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex gap-3 animate-fade-in-up">
                    <AvatarOrb size="sm" active />
                    <div className="min-w-0 max-w-[85%] space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-accent-blue">USDX AI</span>
                        <button
                          type="button"
                          onClick={() => toggleSpeak(m)}
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                            speakingId === m.id
                              ? "bg-accent-blue/20 text-accent-blue"
                              : "text-text-muted hover:bg-bg-elevated hover:text-text-secondary"
                          )}
                          aria-label={speakingId === m.id ? "Stop reading" : "Read aloud"}
                        >
                          {speakingId === m.id ? (
                            <VolumeX className="h-3.5 w-3.5" />
                          ) : (
                            <Volume2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="rounded-[12px] rounded-tl-[4px] border border-border-subtle bg-bg-elevated/60 px-4 py-3">
                        <div className="text-[13px] leading-relaxed text-text-primary/90">
                          <RichText content={m.content} />
                        </div>
                        {m.sources && m.sources.length > 0 && (
                          <div className="mt-3 border-t border-border-subtle pt-2.5">
                            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Sources</p>
                            <div className="flex flex-wrap gap-1.5">
                              {m.sources.map((s, i) => (
                                <SourceBadge key={i} source={s} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
              {isLoading && (
                <div className="flex gap-3 animate-fade-in">
                  <AvatarOrb size="sm" active listening />
                  <div className="flex items-center gap-1 rounded-[12px] rounded-tl-[4px] border border-border-subtle bg-bg-elevated/60 px-4 py-3">
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-accent-blue" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-accent-blue" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-accent-blue" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-8">
              <div className="flex min-h-full flex-col items-center justify-center">
              <AvatarOrb size="xl" active={false} listening={listening} />
              <div className="mt-6 text-center">
                <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2 justify-center">
                  <Sparkles className="h-4 w-4 text-accent-cyan" />
                  Ask USDX AI
                </h3>
                <p className="mt-1.5 text-[13px] text-text-muted max-w-[300px]">
                  Your dedicated voice-enabled assistant for the USDX ecosystem
                </p>
              </div>

              {listening ? (
                <div className="mt-6 flex flex-col items-center gap-3">
                  <Waveform active barCount={32} className="h-8" />
                  <p className="text-[12px] font-medium text-accent-blue animate-pulse">
                    Listening… ({language})
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid w-full max-w-[420px] grid-cols-2 gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); }}
                      className="group rounded-[10px] border border-border-subtle bg-bg-elevated/40 px-3 py-2.5 text-left text-[12px] text-text-secondary transition-all hover:border-accent-blue/30 hover:bg-accent-blue/5 hover:text-text-primary"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
            </div>
          )}

          {/* Input area */}
          <div className="shrink-0 border-t border-border-subtle px-4 py-3">
            <div className="flex items-end gap-2 rounded-[12px] border border-border-subtle bg-bg-elevated/60 p-2 transition-colors focus-within:border-accent-blue/40">
              <button
                type="button"
                onClick={toggleVoice}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-colors",
                  listening
                    ? "bg-error/15 text-error hover:bg-error/20"
                    : "text-text-muted hover:bg-bg-card hover:text-text-secondary"
                )}
                aria-label={listening ? "Stop listening" : "Voice input"}
                title={listening ? "Stop listening" : "Voice input"}
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              {listening && (
                <div className="flex items-center">
                  <Waveform active className="h-6" barCount={16} />
                </div>
              )}

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={listening ? `Listening in ${language}…` : "Ask USDX AI anything…"}
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-[13px] text-text-primary outline-none placeholder:text-text-muted/60"
                disabled={isLoading}
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-all bg-accent-blue text-white",
                  input.trim() && !isLoading
                    ? "shadow-[0_2px_12px_-2px_rgba(59,130,246,0.5)] hover:bg-accent-blue/90"
                    : "cursor-not-allowed opacity-50"
                )}
                aria-label="Send"
                title={input.trim() ? "Send message" : "Type a message to send"}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-text-muted/60">
              {speechSupported
                ? `Voice input & output enabled for ${language}. Speaker buttons read responses aloud.`
                : "Voice input is not supported in this browser. Try Chrome or Edge."}
            </p>
            {micError && (
              <p className="mt-1.5 text-center text-[10px] font-medium text-error">
                {micError}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* History tab */
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
          <p className="text-[12px] font-medium text-text-muted mb-3">Previous chats</p>
          <div className="space-y-2">
            {sessions.length === 0 && (
              <p className="py-6 text-center text-[12px] text-text-muted/70">
                No previous chats yet.
              </p>
            )}
            {sessions.map((s) => (
              <div key={s.id} className="group flex items-center gap-2">
                <button
                  onClick={() => openSession(s)}
                  className="min-w-0 flex-1 rounded-[10px] border border-border-subtle bg-bg-elevated/40 px-3.5 py-2.5 text-left transition-all hover:border-border-medium"
                >
                  <div className="truncate text-[12px] text-text-secondary group-hover:text-text-primary">
                    {s.title}
                  </div>
                  <div className="mt-0.5 text-[10px] text-text-muted/60">
                    {timeAgo(s.updatedAt)} · {s.messages.length} message{s.messages.length === 1 ? "" : "s"}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => deleteSession(s.id)}
                  aria-label="Delete this chat"
                  title="Delete"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
