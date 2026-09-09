export interface LanguageOption {
  label: string;
  code: string; // BCP-47 lang tag for speech recognition
  voiceCode: string; // preferred lang tag for speech synthesis
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { label: "English", code: "en-US", voiceCode: "en-IN" },
  { label: "Tamil", code: "ta-IN", voiceCode: "ta-IN" },
  { label: "Malayalam", code: "ml-IN", voiceCode: "ml-IN" },
  { label: "Kannada", code: "kn-IN", voiceCode: "kn-IN" },
  { label: "Telugu", code: "te-IN", voiceCode: "te-IN" },
  { label: "Hindi", code: "hi-IN", voiceCode: "hi-IN" },
];

export function getLanguageByLabel(label: string): LanguageOption {
  return (
    LANGUAGE_OPTIONS.find((l) => l.label === label) ??
    LANGUAGE_OPTIONS[0]
  );
}

export interface SpeechRecognitionResultItem {
  transcript: string;
}

export interface SpeechRecognitionResultLike {
  results: SpeechRecognitionResultItem[][];
  resultIndex: number;
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionResultLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

export function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const W = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return W.SpeechRecognition ?? W.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== "undefined" && getSpeechRecognitionCtor() !== null;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";
}

export function pickVoice(code: string): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const exact = voices.find(
    (v) => v.lang.replace("_", "-").toLowerCase() === code.toLowerCase()
  );
  if (exact) return exact;
  const base = code.split("-")[0].toLowerCase();
  const baseMatches = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(base)
  );
  if (!baseMatches.length) return null;
  const localService = baseMatches.find((v) => v.localService);
  const online = baseMatches.find((v) => !v.localService);
  return online ?? localService ?? baseMatches[0];
}

export function getVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve([]);
      return;
    }
    const synth = window.speechSynthesis;
    const current = synth.getVoices();
    if (current.length) {
      resolve(current);
      return;
    }
    let settled = false;
    const onVoicesChanged = () => {
      if (settled) return;
      settled = true;
      synth.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(synth.getVoices());
    };
    synth.addEventListener("voiceschanged", onVoicesChanged);
    setTimeout(() => {
      if (settled) return;
      settled = true;
      synth.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(synth.getVoices());
    }, 1500);
  });
}

export async function speak(text: string, code: string): Promise<void> {
  if (!isSpeechSynthesisSupported() || !text) return;
  // Ensure only one playback at once across all languages.
  cancelSpeech();
  const synth = window.speechSynthesis;
  await getVoices();
  const voice = pickVoice(code);
  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) utterance.voice = voice;
  utterance.lang = (voice?.lang ?? code).replace("_", "-");
  utterance.rate = 1;
  utterance.pitch = 1;
  await new Promise<void>((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    synth.speak(utterance);
  });
}

export async function speakNeural(text: string, code: string): Promise<boolean> {
  if (!text) return false;
  const playbackId = ++activePlaybackId;
  cleanupAudio();
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language: code }),
    });
    if (!res.ok) return false;
    const blob = await res.blob();
    // A newer request took over while we were fetching — do not play.
    if (playbackId !== activePlaybackId) return false;
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;
    await new Promise<void>((resolve) => {
      const done = () => {
        cleanupAudio();
        resolve();
      };
      audio.onended = done;
      audio.onerror = done;
      audio.play().catch(done);
    });
    return true;
  } catch {
    if (playbackId === activePlaybackId) cleanupAudio();
    return false;
  }
}

let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl = "";
let activePlaybackId = 0;

function cleanupAudio() {
  if (currentAudio) {
    try {
      currentAudio.pause();
    } catch {
      /* ignore */
    }
    currentAudio = null;
  }
  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = "";
  }
}

export function cancelSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  activePlaybackId++;
  cleanupAudio();
}
