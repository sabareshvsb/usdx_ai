import { NextRequest, NextResponse } from "next/server";
import {
  retrieveQa,
  qaMatchesToContext,
  QA_CATEGORIES,
} from "@/lib/usdx-qa";
import {
  retrieveKnowledge,
  sourcesCatalog,
  SWAP_RULES_ANSWER,
} from "@/lib/knowledge";
import { fetchDexScreenerData } from "@/lib/dexscreener";
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

function isSwapRulesQuestion(question: string): boolean {
  const q = question.toLowerCase();
  return /\bswap\b/.test(q) && (/\brules?\b/.test(q) || q.includes("dai"));
}

function isPriceQuery(question: string): boolean {
  const q = question.toLowerCase();
  return (
    /\bprice\b/.test(q) ||
    /\bcurrent\s*(price|value|rate|worth)\b/.test(q) ||
    /\blive\s*(price|value|rate|worth|data)\b/.test(q) ||
    /\bhow\s*much\s*(is|does|cost|worth)\b/.test(q) ||
    /\btoken\s*(price|value|worth|rate)\b/.test(q) ||
    /\bmarket\s*(cap|price|data)\b/.test(q) ||
    /\btrading\s*(volume|data|info)\b/.test(q) ||
    /\b24[hH]\s*(volume|change|price|high|low)\b/.test(q) ||
    /\bwhat'?s?\s+the\s+.*\bprice\b/.test(q) ||
    /\bwhat\s+is\s+usdx\s+(price|worth|value|trading at)\b/.test(q) ||
    /\bwhere\s+is\s+.*\bprice\b/.test(q) ||
    /\blaunch\b/.test(q) && /\bdate\b/.test(q)
  );
}

async function buildLivePriceContext(): Promise<string> {
  try {
    const d = await fetchDexScreenerData();
    const lines = [
      `[LIVE PRICE DATA — authoritative real-time data fetched from DexScreener]. The user is asking about the token's live price, so answer using this block as the source of truth. State the current price clearly with the figures below.`,
      `Current price: $${d.priceUsd}`,
      `Price change 1h: ${d.priceChange1h}%`,
      `Price change 24h: ${d.priceChange24h}%`,
      `24h high: $${d.high24h}`,
      `24h low: $${d.low24h}`,
      `24h volume: $${d.volume24h.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      `1h volume: $${d.volume1h.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      `24h transactions: ${d.txns24h} (${d.buys24h} buys, ${d.sells24h} sells)`,
      `Liquidity: $${d.liquidityUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      `FDV: $${d.fdv.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      `Market Cap: $${d.marketCap.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      `Pair created: ${new Date(d.pairCreatedAt).toISOString().split("T")[0]}`,
      `DexScreener: ${d.dexUrl}`,
    ];
    return lines.join("\n");
  } catch {
    return "";
  }
}

function swapRulesSources() {
  return sourcesCatalog
    .filter((s) => s.title === "Project Rules")
    .map((s) => ({ title: s.title, source: s.category, updated: s.updated }));
}

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

  if (isSwapRulesQuestion(question)) {
    return NextResponse.json({
      content: SWAP_RULES_ANSWER,
      sources: swapRulesSources(),
      unknown: false,
    });
  }

  const provider = process.env.AI_PROVIDER ?? "mock";
  const hasKey = Boolean(process.env.AI_API_KEY);
  const fallsBackToKb = retrieveKnowledge(question);

  let content: string;
  let unknown: boolean;
  const hasPriceData = isPriceQuery(question);

  if (provider === "mock" || !hasKey) {
    content =
      language === "en"
        ? fallsBackToKb.text
        : FALLBACK_UNKNOWN[language];
    unknown = fallsBackToKb.unknown;
  } else {
    const matches = retrieveQa(question, 8);
    const qaContext = qaMatchesToContext(matches, 16000);
    const priceContext = hasPriceData ? await buildLivePriceContext() : "";
    const kbContext = [
      priceContext,
      qaContext && `Reference material (use only if helpful for context; do not override live price data):\n${qaContext}`,
      fallsBackToKb.unknown ? "" : fallsBackToKb.text,
    ]
      .filter(Boolean)
      .join("\n\n");

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
  if (hasPriceData) {
    titles.add("Live Price (DexScreener)");
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
2. Base your answer on the knowledge base context below AND on earlier parts of this conversation. Do NOT invent USDX rules, rates, APY, ranks, packages, or policies.
3. If the knowledge base context and the earlier conversation together do NOT contain the answer, reply exactly: "I couldn't find that information in the USDX knowledge base."
4. Give DETAILED, thorough answers — never a one- or two-line summary. Structure each answer with several short sections or paragraphs: a clear definition/introduction, how it works (steps or bullet points), a practical example where useful, and the important caveats (e.g. "specific rates and thresholds are defined in the official USDX rules and may change"). Preserve stated facts such as "the project states...".
5. Treat follow-up questions as continuations of the earlier conversation: connect them to what was already discussed instead of answering in isolation.
6. Never mention "knowledge base context" or "retrieved context" in your reply.
7. When a "[LIVE PRICE DATA" block is present in the context, the user's question is about the token's current price — the live block is authoritative. Always state the current price and the key figures (24h change, 24h volume, liquidity, market cap) from that block with the timestamp context, and keep any general USDX info brief behind it.

LANGUAGE RULE (CRITICAL):
- Reply ENTIRELY in ${langName} (language code: "${language}").
- Use proper ${langName} words/script throughout (headings, bullets, and text).
- Keep proper nouns as-is: USDX, USDX-SMART, DAI, Base, TokenPocket, Web3, smart contract, staking, APY, Yield, Trigger Peg, etc.

KNOWLEDGE BASE CONTEXT:
${kbContext}`;

  const lastHistory = history[history.length - 1];
  const messages = [
    { role: "system" as const, content: system },
    ...history.slice(-9).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user" || last.content !== lastHistory?.content) {
    messages.push({ role: "user" as const, content: question });
  }

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