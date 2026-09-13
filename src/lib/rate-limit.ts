const buckets = new Map<string, number[]>();

const LIMIT = 10;
const WINDOW_MS = 60 * 1000;

/** Minimal in-memory rate limiter (per instance). Returns remaining allowance. */
export function rateLimit(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= LIMIT) {
    buckets.set(key, hits);
    const retryAfter = Math.ceil(
      (WINDOW_MS - (now - hits[0])) / 1000
    );
    return { ok: false, retryAfter };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { ok: true, retryAfter: 0 };
}