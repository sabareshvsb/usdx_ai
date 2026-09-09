import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TtsRequestBody {
  text: string;
  language?: string;
}

const VOICE_MAP: Record<string, string> = {
  "en-IN": "Kore",
  "en-US": "Puck",
  "en-GB": "Charon",
  "ta-IN": "Puck",
  "ml-IN": "Puck",
  "kn-IN": "Puck",
  "te-IN": "Puck",
  "hi-IN": "Puck",
};

function normalizeLang(language?: string): string {
  const code = (language ?? "en-IN").replace("_", "-");
  const candidates = [code, code.split("-")[0], "en-IN"];
  for (const c of candidates) {
    if (VOICE_MAP[c]) return c;
  }
  return "en-IN";
}

function pcmToWav(pcm: Buffer, sampleRate: number, channels: number, bitsPerSample: number): Buffer {
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const dataSize = pcm.length;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  pcm.copy(buffer, 44);
  return buffer;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
  }

  let body: TtsRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  const lang = normalizeLang(body.language);
  const voice = process.env.AI_TTS_VOICE ?? VOICE_MAP[lang] ?? "Puck";
  const ttsModel =
    process.env.AI_TTS_MODEL ?? "gemini-3.1-flash-tts-preview";
  const languageCode = `${lang.split("-")[0]}-${lang.split("-")[1] ?? "IN"}`;
  const configuredBase = process.env.AI_TTS_BASE_URL ?? process.env.AI_BASE_URL ?? "";
  const apiBase = configuredBase.includes("/openai")
    ? configuredBase.replace(/\/openai\/?$/, "")
    : configuredBase || "https://generativelanguage.googleapis.com/v1beta";

  try {
    const res = await fetch(
      `${apiBase}/models/${ttsModel}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text }],
            },
          ],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              languageCode,
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voice,
                },
              },
            },
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text().catch(() => "unknown error");
      console.error("Gemini TTS error:", res.status, err.slice(0, 500));
      return NextResponse.json(
        { error: "TTS synthesis failed" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const part = data?.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData?: { data?: string; mimeType?: string } }) =>
        p?.inlineData?.data
    );

    const audioBase64: string | undefined = part?.inlineData?.data;
    const mimeType: string | undefined =
      part?.inlineData?.mimeType ?? "audio/L16;codec=pcm;rate=24000";

    if (!audioBase64) {
      return NextResponse.json({ error: "No audio returned" }, { status: 502 });
    }

    const audioBuffer = Buffer.from(audioBase64, "base64");

    const normalizedMime = (mimeType ?? "").toLowerCase();
    if (normalizedMime.includes("l16") || normalizedMime.includes("pcm")) {
      const rateMatch = normalizedMime.match(/rate=(\d+)/);
      const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;
      const channelMatch = normalizedMime.match(/(?:channels?|ch)=(\d+)/);
      const channels = channelMatch ? Number(channelMatch[1]) : 1;
      const wav = pcmToWav(audioBuffer, sampleRate, channels, 16);
      return new NextResponse(new Uint8Array(wav), {
        status: 200,
        headers: {
          "Content-Type": "audio/wav",
          "Content-Length": String(wav.length),
          "Cache-Control": "no-store",
        },
      });
    }

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType ?? "audio/mpeg",
        "Content-Length": String(audioBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("Gemini TTS error:", e);
    return NextResponse.json({ error: "TTS synthesis failed" }, { status: 502 });
  }
}