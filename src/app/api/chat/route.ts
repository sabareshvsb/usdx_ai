import { NextRequest, NextResponse } from "next/server";
import {
  retrieveQa,
  qaMatchesToContext,
  QA_CATEGORIES,
} from "@/lib/usdx-qa";
import { retrieveKnowledge, sourcesCatalog } from "@/lib/knowledge";
import {
  normalizeLang,
  FALLBACK_TEXT,
  FALLBACK_UNKNOWN,
  type LangCode,
} from "@/lib/translations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  language?: string;
}

const LANGUAGE_NAMES: Record<LangCode, string> = {
  en: "English",
  ta: "Tamil (தமிழ்)",
  ml: "Malayalam (മലയാളം)",
  kn: "Kannada (ಕನ್ನಡ)",
  te: "Telugu (తెలుగు)",
  hi: "Hindi (हिन्दी)",
};

export async function POST(request: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const lastUser = [...(body.messages ?? [])]
    .reverse()
    .find((m) => m.role === "user");
  const question = lastUser?.content?.trim() ?? "";
  const language = normalizeLang(body.language);
  const provider = process.env.AI_PROVIDER ?? "mock";
  const hasKey = Boolean(process.env.AI_API_KEY);

  const fallsBackToKb = retrieveKnowledge(question);

  let content: string;
  let unknown: boolean;

  if (provider === "mock" || !hasKey) {
    content =
      language === "en"
        ? fallsBackToKb.text
        : FALLBACK_UNKNOWN[language];
    unknown = fallsBackToKb.unknown;
  } else {
    const matches = retrieveQa(question, 8);
    const qaContext = qaMatchesToContext(matches, 16000);
    const kbContext = qaContext || fallsBackToKb.text;

    let aiText = "";
    try {
      aiText = await callGemini(question, body.messages, language, kbContext);
    } catch (e) {
      console.error("Gemini call failed:", e);
    }

    if (aiText) {
      content = aiText;
      unknown = matches.length === 0 && fallsBackToKb.unknown;
    } else {
      content =
        language === "en" ? fallsBackToKb.text : FALLBACK_UNKNOWN[language];
      unknown = fallsBackToKb.unknown;
    }
  }

  const titles = new Set<string>();
  if (fallsBackToKb.sources) {
    for (const t of fallsBackToKb.sources) titles.add(t);
  }
  if (content.includes("USDX-SMART") || content.includes("USDX")) {
    titles.add("USDX Knowledge Base");
  }
  const sources = [...titles].map((title) => {
    const match = sourcesCatalog.find((s) => s.title === title);
    return {
      title,
      source: match?.category ?? "Knowledge",
      updated: match?.updated ?? undefined,
    };
  });

  return NextResponse.json({ content, sources, unknown });
}

async function callGemini(
  question: string,
  history: ChatRequestBody["messages"],
  language: LangCode,
  kbContext: string
): Promise<string> {
  const baseUrl =
    process.env.AI_BASE_URL ??
    "https://generativelanguage.googleapis.com/v1beta/openai";
  const model = process.env.AI_MODEL ?? "gemini-3.5-flash";
  const langName = LANGUAGE_NAMES[language];

  const system = `You are USDX-AI, a specialized assistant for the USDX-SMART ecosystem.

TOPICS WE COVER:
${QA_CATEGORIES.map((c) => `- ${c}`).join("\n")}

RULES:
1. Answer ONLY USDX-SMART / USDX / related blockchain questions. Refuse unrelated topics politely.
2. Base your answer on the knowledge base context below. Do NOT invent USDX rules, rates, APY, ranks, packages, or policies.
3. If the context does not contain the answer, reply: "I couldn't find that information in the USDX knowledge base."
4. Be concise and helpful. Use short paragraphs or bullets. Preserve stated facts such as "the project states...".
5. Never mention "knowledge base context" or "retrieved context" in your reply.

LANGUAGE RULE (CRITICAL):
- Reply ENTIRELY in ${langName} (language code: "${language}").
- Use proper ${langName} words/script throughout (headings, bullets, and text).
- Keep proper nouns as-is: USDX, USDX-SMART, DAI, Base, TokenPocket, Web3, smart contract, staking, APY, Yield, Trigger Peg, etc.

KNOWLEDGE BASE CONTEXT:
${kbContext}`;

  const messages = [
    { role: "system" as const, content: system },
    ...history.slice(-8).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: question },
  ];

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "unknown error");
    console.error("Gemini API error:", res.status, err.slice(0, 500));
    throw new Error(`Gemini API error ${res.status}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) return content;
  return FALLBACK_TEXT[language];
}