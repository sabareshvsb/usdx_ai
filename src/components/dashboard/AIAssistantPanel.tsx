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

export default function AIAssistantPanel() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"chat" | "history">("chat");
  const [language, setLanguage] = useState("English");
  const [langOpen, setLangOpen] = useState(false);
  const [speechSupported] = useState<boolean>(
    typeof window !== "undefined" ? isSpeechRecognitionSupported() : false
  );

  const endRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const hasConversation = messages.length > 0;

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
    recognition.lang = getLanguageByLabel(language).code;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        alert("Microphone access was denied. Please allow microphone access in your browser.");
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
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
    setMessages([]);
  };

  return (
    <div className="flex h-full flex-col rounded-[14px] border border-border-subtle bg-bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
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
      <div className="flex border-b border-border-subtle">
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
        <div className="flex-1 flex flex-col overflow-hidden">
          {hasConversation ? (
            <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
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
            <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
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
          )}

          {/* Input area */}
          <div className="border-t border-border-subtle px-4 py-3">
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
                className="flex-1 bg-transparent px-1 py-2 text-[13px] text-text-primary outline-none placeholder:text-text-muted/60"
                disabled={isLoading}
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-all",
                  input.trim() && !isLoading
                    ? "bg-accent-blue text-white shadow-[0_2px_12px_-2px_rgba(59,130,246,0.5)] hover:bg-accent-blue/90"
                    : "bg-bg-card text-text-muted cursor-not-allowed"
                )}
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-text-muted/60">
              {speechSupported
                ? `Voice input & output enabled for ${language}. Speaker buttons read responses aloud.`
                : "Voice input is not supported in this browser. Try Chrome or Edge."}
            </p>
          </div>
        </div>
      ) : (
        /* History tab */
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-[12px] font-medium text-text-muted mb-3">Recent conversations</p>
          <div className="space-y-2">
            {["How does USDX staking work?", "Calculate my compounding", "What are the ranks?"].map((q) => (
              <button
                key={q}
                className="w-full rounded-[10px] border border-border-subtle bg-bg-elevated/40 px-3.5 py-2.5 text-left text-[12px] text-text-secondary transition-all hover:border-border-medium hover:text-text-primary"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
