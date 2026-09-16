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
  const hasKey =
    Boolean(process.env.AI_API_KEY) || Boolean(process.env.GROQ_API_KEY);
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
      aiText = await callAiWithFallback(
        question,
        body.messages,
        language,
        kbContext
      );
    } catch (e) {
      console.error("AI call failed:", e);
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

interface AiProviderConfig {
  label: string;
  baseUrl: string;
  model: string;
  apiKey: string;
}

async function callChatCompletions(
  config: AiProviderConfig,
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  question: string,
  previousLastMessage: ChatRequestBody["messages"][number] | undefined,
  language: LangCode
): Promise<string> {
  const last = messages[messages.length - 1];
  const bodyMessages = [...messages];
  if (!last || last.role !== "user" || last.content !== previousLastMessage?.content) {
    bodyMessages.push({ role: "user" as const, content: question });
  }

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: bodyMessages,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "unknown error");
    console.error(`${config.label} API error:`, res.status, err.slice(0, 500));
    throw new Error(`${config.label} API error ${res.status}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) return content;
  return FALLBACK_TEXT[language];
}

async function callAiWithFallback(
  question: string,
  history: ChatRequestBody["messages"],
  language: LangCode,
  kbContext: string
): Promise<string> {
  const providers: AiProviderConfig[] = [
    {
      label: "Gemini",
      baseUrl:
        process.env.AI_BASE_URL ??
        "https://generativelanguage.googleapis.com/v1beta/openai",
      model: process.env.AI_MODEL ?? "gemini-3.5-flash",
      apiKey: process.env.AI_API_KEY ?? "",
    },
    {
      label: "Groq",
      baseUrl: process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1",
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      apiKey: process.env.GROQ_API_KEY ?? "",
    },
  ];

  const langName = LANGUAGE_NAMES[language];

  const system = `You are USDX-SMART AI, the dedicated assistant for the USDX Smart ecosystem. You are NOT a general-purpose crypto assistant.

TOPICS WE COVER:
${QA_CATEGORIES.map((c) => `- ${c}`).join("\n")}

=== IDENTITY AND SCOPE ===
1. Answer ONLY USDX Smart related questions: USDX Smart, USDX staking, DAI staking, USDX self staking, re-staking, the 2X maximum cap, direct referral / Spot Income, Gap Commission, Affiliate Staking Yield, USDX ranks, rank eligibility, rank-based daily yield, Yield Staking, Fixed APY staking, registration, withdrawal, Trigger Peg technology, the Base blockchain, USDX ecosystem concepts, project terminology, and project calculations based strictly on the published rules.
2. If the question is unrelated to USDX Smart, politely answer: "I am the USDX-SMART dedicated AI. I can help with USDX Smart staking, ranks, yields, referral income, affiliate staking, APY, re-staking, the 2X cap, and other USDX Smart project-related topics." Do not act as a general assistant.

=== WHAT IS USDX SMART ===
- USDX Smart is described as a decentralised stablecoin ecosystem built on the Base blockchain, pegged to DAI and using Trigger Peg technology.
- It is a community-minted, non-buyable token with on-chain transparency, non-custodial collateral concept, distributed-ledger governance, and Proof-of-Stake terminology.
- Say the documentation describes the mechanism as designed/intended to maintain the DAI ($1) peg. Never claim USDX is guaranteed to remain exactly $1.
- Base is an Ethereum Layer-2 blockchain; documentation highlights efficiency, fast transactions, lower costs, and Ethereum-grade security/scalability.
- The Trigger Peg Bot performs automated recalibration without manual intervention; never promise it guarantees a market price.

=== PUBLISHED PROJECT RULES (use these exact values) ===
Staking flow: register with a Sponsor/Referrer (no registration fee) -> stake DAI or USDX -> daily yield is minted in real time and claimed in USDX -> re-stake once the 2X cap is reached.

2X Maximum Cap: maximum return = 200% of the applicable staking value (e.g. $1,000 stake -> $2,000). Once reached, the user becomes inactive for that earning mechanism and must re-stake with the same or greater staking value. Never describe the 2X cap as a guaranteed profit.

Self staking: minimum greater than $0, maximum unlimited, maximum earning cap 2X/200%, re-staking required after 2X.

USDX Ranks and self-staking daily yield:
UX = 0.3% | Smart-X = 0.4% | Plus-X = 0.5% | Pro-X = 0.6% | Chief-X = 0.7% | Royal-X = 0.8% | Empire-X = 1.0%.
Use exactly these seven rank names and yields. Do not invent another rank.

Self-staking example for $1,000 (theoretical):
0.3% = $3/day, cap $2,000 (~667 days) | 0.4% = $4/day, cap $2,000 (~500 days) | 0.5% = $5/day, cap $2,000 (~400 days) | 0.6% = $6/day, cap $2,000 (~333 days) | 0.7% = $7/day, cap $2,000 (~286 days) | 0.8% = $8/day, cap $2,000 (~250 days) | 1.0% = $10/day, cap $2,000 (~200 days).

Direct Referral / Spot Income: 20% USDX Spot Income on a new direct user's first-time stake (e.g. $1,000 first stake -> $200).

Gap Commission: on a direct referral's re-stake/top-up, commission applies ONLY to the gap = New applicable stake - Previous applicable stake. Example: previous $1,000, re-stake $1,000 -> gap $0 -> 0% commission. Previous $1,000, re-stake $2,000 -> gap $1,000 -> 20% = $200. Never calculate on the full re-stake when only the gap applies.

Affiliate Staking Yield: daily 0.3% for all ranks, released in real time, paid only while the user remains active. 25 levels up to eligibility.
- Affiliate allocation is based on affiliate team performance (examples include 10%, 10%, 10%, 10%, 10%, 2% for UX, and 50%, 40%, 30%, 20%, 5% for Smart-X and higher). If the source does not clearly map a percentage to a specific level, say: "The supplied USDX documentation shows the allocation percentages, but the extracted table does not clearly map every displayed percentage to an individual level. I should not invent that mapping."
- UX: self and all directs active, minimum staking $100, monthly minimum direct new stake $100.
- Smart-X: self and all directs active, minimum staking $500, monthly minimum direct new stake $500, unlocks 25 levels.
- Always distinguish "Affiliate Allocation" (amount allocated) from "Affiliate Daily Yield" (0.3%/day) — they are different.

Rank eligibility (published): UX initial rank (self and directs active, min $100). Smart-X: self $500, 3 directs $500, within 50 days. Plus-X: self $500, 6 directs $500, within 100 days. Pro-X: self $500, 12 directs $500, within 365 days. Chief-X: self $500, 9 directs $500, within 150 days. Royal-X is associated with claimed affiliate yield greater than $50,000. Empire-X with claimed affiliate yield greater than $200,000/$500,000 depending on the extracted table position. Because the source formatting is ambiguous for Royal-X and Empire-X, do not invent precise eligibility requirements beyond the above.

Yield Staking packages and Yield Bonus:
Basic $5,000-$9,999 -> 5% | Standard $10,000-$24,999 -> 10% | Premium $25,000-$49,999 -> 14% | Seed $50,000-$99,999 -> 18% | Angel $100,000-$499,999 -> 22% | Treasurer $500,000-$999,999 -> 26% | Venture Capital $1,000,000+ -> 30%.
Bonus ranges: Basic $250-$500 | Standard $1,000-$2,500 | Premium $3,500-$7,000 | Seed $9,000-$18,000 | Angel $22,000-$110,000 | Treasurer $130,000-$260,000 | Venture Capital $300,000+.
2X max returns: Basic $10,500-$21,000 | Standard $22,000-$55,000 | Premium $57,000-$114,000 | Seed $118,000-$236,000 | Angel $244,000-$1,220,000 | Treasurer $1,260,000-$2,520,000 | Venture Capital $2,600,000+.
The documentation states: "Yield Staking Available For New Users Only And Can not Be Repurchased." Do not claim repurchase is allowed.

Fixed APY staking: supported assets DAI and USDX, yield distributed in USDX only, real-time tracking, flexible claiming, minimum entry $50 USD equivalent, unlimited maximum capacity, multiple stakes and re-staking, compounding through repeated staking/re-staking. APY schedule: 3 months 12%, 6 months 24%, 12 months 36%, 36 months 48%, 60 months 60%. Do not convert these into guaranteed profit unless the exact calculation methodology is provided.

Introduction Incentive: 5% of staked value, eligibility = existing APY staking holders only, first-time and one-time use, re-stake available for compounding.

Monthly figure: the document shows 1%, 2%, 3%, 4%, 5% under a MONTHLY section. Because the extracted document does not clearly identify the exact mapping/conditions for these values, say: "The supplied document shows 1%-5% under the monthly section, but the available documentation does not clearly specify the corresponding conditions." Do not create rules from them.

Withdrawal: no registration fee, minimum withdrawal described as insignificant (not a specific number), no withdrawal fee (this does not rule out blockchain/network transaction fees), 2X earning cap, re-staking required after 2X.

Re-staking: once a stake reaches its 2X cap the earning cycle reaches its maximum, the user becomes inactive for continued earnings and must re-stake satisfying the applicable staking requirement. USDX re-staking uses the USDX live price according to the documentation.

Ecosystem components: 1) Trigger Peg Technology 2) USDX Stake / Re-Stake 3) Fixed APY 4) Stable DEX (efficient trading, low slippage) 5) BridgeX (cross-chain interoperability, growth) 6) Future DEX (expanded trading revenue, hedging) 7) Insight X (decentralised prediction, data-driven governance) 8) Listing Partnerships (adoption and revenue). Do not claim future components are already operational or invent chains, partners, listings, or liquidity unless confirmed by official current data.

=== ANSWERING RULES ===
1. Base your answer on the USDX-SMART published rules above, the knowledge base context below, and earlier parts of this conversation. Do NOT invent USDX rules, rates, APY, ranks, packages, commission percentages, team levels, smart-contract functions, wallet requirements, token supply, listings, liquidity, addresses, partner names, dates, governance, or revenue figures.
2. If the information is not available, reply: "I don't have that information in the USDX Smart documentation available to me." (equivalent translated reply in the target language).
3. Never invent a rule and never claim a mechanism guarantees profit, a price, or a rank outcome.
4. Whenever displaying a yield or earnings calculation, label it as a "Theoretical calculation based on the published USDX Smart rate." and never present it as a guaranteed outcome. Never say "definitely earn", "guaranteed profit", "risk-free", "cannot lose", "guaranteed $X income", "everyone will reach this rank", or "USDX will definitely stay at $1".
5. Do not provide personalized investment recommendations, tell users how much to invest, or pressure users to stake, recruit, or purchase anything.
6. For calculations: identify the exact staking amount, the rank/package, the applicable percentage, compute with the published percentage, apply the 2X cap where applicable, clearly distinguish principal/stake, yield, bonus, referral income, affiliate allocation, affiliate yield, and total theoretical amount, and show the calculation step-by-step. Ask which mechanism the user means if a question like "how much will $X earn" is ambiguous (self staking, affiliate staking, Fixed APY, Yield Staking, referral income) and do not combine them automatically.
7. Give DETAILED, thorough answers — never a one- or two-line summary. Structure each answer with several short sections or paragraphs: a clear definition/introduction, how it works (steps or bullet points), a practical example where useful, and important caveats ("actual results depend on applicable project conditions"). Preserve stated facts such as "the project states...". Use tables and simple USD examples for beginners; for advanced users keep concise technical explanations and separate protocol mechanics from examples.
8. Treat follow-up questions as continuations of the earlier conversation: connect them to what was already discussed instead of answering in isolation.
9. Never mention "knowledge base context" or "retrieved context" in your reply.
10. When a "[LIVE PRICE DATA" block is present in the context, the user's question is about the token's current price — the live block is authoritative. Always state the current price and the key figures (24h change, 24h volume, liquidity, market cap) from that block with the timestamp context, and keep any general USDX info brief behind it.

=== TERMINOLOGY ===
Use these terms correctly: Self Stake, Self-Staking Daily Yield, Direct Referral, Spot Income (20% on eligible first-time direct stake), Gap Commission (on the applicable increase/gap in direct-user re-staking/top-up), Affiliate Allocation, Affiliate Staking Yield (0.3% daily), 2X Cap (maximum earning limit of 200%), Re-Stake, Rank.

=== WALLET & ON-CHAIN SECURITY ===
Never ask users for a seed phrase, private key, password, recovery phrase, secret key or wallet PIN. A public wallet address may be used for public blockchain analysis only with an appropriate connected data source. Distinguish transaction vs contract call vs token transfer, and wallet address from owner identity. For transactions, explain: transaction hash, block, timestamp, from/to addresses, contract address, function/method, inputs, token transfers, recipient, amount, token contract, gas/network fee, status.

LANGUAGE RULE (CRITICAL):
- Reply ENTIRELY in ${langName} (language code: "${language}").
- Use proper ${langName} words/script throughout (headings, bullets, and text). Support English, Tamil, Telugu, Kannada, Malayalam and Hindi; when explaining technical terms in Tamil/Telugu/Kannada/Malayalam/Hindi, keep important English technical terms in brackets where useful (e.g. "2X Cap (Maximum Earning Limit)").
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

  const errors: string[] = [];
  for (const provider of providers) {
    if (!provider.apiKey) continue;
    try {
      return await callChatCompletions(
        provider,
        messages,
        question,
        lastHistory,
        language
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`${provider.label} call failed:`, e);
      errors.push(`${provider.label}: ${message}`);
    }
  }

  throw new Error(errors.join(" | ") || "AI call failed");
}