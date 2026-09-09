import data from "@/data/usdx-qa.json";

export interface UsdxQaEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const QA_BANK: UsdxQaEntry[] = data as unknown as UsdxQaEntry[];

export const QA_CATEGORIES = [...new Set(QA_BANK.map((e) => e.category))];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

const STOP = new Set([
  "what", "why", "how", "when", "where", "which", "does", "is", "are",
  "the", "and", "for", "with", "this", "that", "from", "your", "you",
  "can", "in", "of", "to", "a", "an", "on", "about", "usdx", "smart",
]);

function scoreEntry(entry: UsdxQaEntry, qTokens: string[]): number {
  const qSet = new Set(qTokens);
  let score = 0;
  const qTokensFiltered = qTokens.filter((t) => !STOP.has(t));

  const qTerms = tokenize(entry.question).filter((t) => !STOP.has(t));
  const aTerms = tokenize(entry.answer).filter((t) => !STOP.has(t));
  const qTermsSet = new Set(qTerms);
  const aTermsSet = new Set(aTerms);

  for (const t of qTokensFiltered) {
    if (qTermsSet.has(t)) score += 3;
    else if (aTermsSet.has(t)) score += 1;
    else if (
      [...qTermsSet].some((qt) => qt.includes(t) || t.includes(qt))
    )
      score += 2;
    else if (
      [...aTermsSet].some((at) => at.includes(t) || t.includes(at))
    )
      score += 1;
  }
  return score;
}

export interface QaMatch {
  entry: UsdxQaEntry;
  score: number;
}

const CACHE = new Map<string, QaMatch[]>();

export function retrieveQa(question: string, limit = 6): QaMatch[] {
  const trimmed = question.trim();
  if (!trimmed) return [];
  const cacheKey = trimmed.toLowerCase();
  const cached = CACHE.get(cacheKey);
  if (cached) return cached.slice(0, limit);

  const qTokens = tokenize(trimmed);
  const scored = QA_BANK.map((entry) => ({
    entry,
    score: scoreEntry(entry, qTokens),
  }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, limit);
  CACHE.set(cacheKey, top);
  return top;
}

export function qaMatchesToContext(matches: QaMatch[], maxChars = 14000): string {
  let out = "";
  for (const m of matches) {
    const block = `[Q${m.entry.id}] (${m.entry.category})\nQ: ${m.entry.question}\nA: ${m.entry.answer}`;
    if (out.length + block.length + 1 > maxChars) break;
    out += block + "\n\n";
  }
  return out.trim();
}