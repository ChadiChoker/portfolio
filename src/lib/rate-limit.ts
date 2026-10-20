// Sliding-window rate limiter for the chat endpoint: a per-visitor limit plus a global ceiling.
// In-memory, so it is per server instance — a cheap first line of defence on serverless; the
// Anthropic console's monthly spend limit is the hard backstop.

type Options = { perKey: number; globalLimit: number; windowMs: number };
export type RateResult = { ok: true } | { ok: false; retryAfterSec: number };

export function createRateLimiter({ perKey, globalLimit, windowMs }: Options) {
  const hits = new Map<string, number[]>();
  let global: number[] = [];
  let lastPrune = 0;

  const fresh = (list: number[], now: number) => list.filter((t) => now - t < windowMs);

  function prune(now: number) {
    for (const [key, list] of hits) {
      const kept = fresh(list, now);
      if (kept.length) hits.set(key, kept); else hits.delete(key);
    }
    lastPrune = now;
  }

  return {
    check(key: string, now = Date.now()): RateResult {
      if (now - lastPrune > windowMs) prune(now);
      global = fresh(global, now);
      const mine = fresh(hits.get(key) ?? [], now);
      const full = mine.length >= perKey ? mine : global.length >= globalLimit ? global : null;
      if (full) {
        hits.set(key, mine);
        return { ok: false, retryAfterSec: Math.max(1, Math.ceil((full[0] + windowMs - now) / 1000)) };
      }
      mine.push(now); global.push(now); hits.set(key, mine);
      return { ok: true };
    },
    size: () => hits.size,
  };
}
