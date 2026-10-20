import { describe, it, expect } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";

const MIN = 60_000;

describe("createRateLimiter", () => {
  it("allows up to the per-visitor limit inside the window, then blocks with a retry time", () => {
    const rl = createRateLimiter({ perKey: 3, globalLimit: 100, windowMs: 10 * MIN });
    expect([0, 1, 2].map(() => rl.check("1.1.1.1", 0).ok)).toEqual([true, true, true]);
    const blocked = rl.check("1.1.1.1", 1000);
    expect(blocked).toMatchObject({ ok: false });
    expect(!blocked.ok && blocked.retryAfterSec).toBeGreaterThan(0);
  });
  it("tracks visitors separately", () => {
    const rl = createRateLimiter({ perKey: 1, globalLimit: 100, windowMs: MIN });
    expect(rl.check("a", 0).ok).toBe(true);
    expect(rl.check("b", 0).ok).toBe(true);
    expect(rl.check("a", 0).ok).toBe(false);
  });
  it("slides: requests older than the window stop counting", () => {
    const rl = createRateLimiter({ perKey: 2, globalLimit: 100, windowMs: MIN });
    rl.check("a", 0); rl.check("a", 30_000);
    expect(rl.check("a", 50_000).ok).toBe(false);
    expect(rl.check("a", 61_000).ok).toBe(true); // the t=0 hit has expired
  });
  it("enforces a global ceiling across all visitors", () => {
    const rl = createRateLimiter({ perKey: 100, globalLimit: 3, windowMs: MIN });
    expect(["a", "b", "c"].map((k) => rl.check(k, 0).ok)).toEqual([true, true, true]);
    expect(rl.check("d", 0).ok).toBe(false);
  });
  it("blocked requests don't consume budget", () => {
    const rl = createRateLimiter({ perKey: 1, globalLimit: 2, windowMs: MIN });
    rl.check("a", 0);
    for (let i = 0; i < 10; i++) rl.check("a", 0);
    expect(rl.check("b", 0).ok).toBe(true);
  });
  it("keeps memory bounded by pruning idle visitors", () => {
    const rl = createRateLimiter({ perKey: 5, globalLimit: 1e9, windowMs: MIN });
    for (let i = 0; i < 5000; i++) rl.check(`ip-${i}`, 0);
    rl.check("late", 2 * MIN);
    expect(rl.size()).toBeLessThanOrEqual(1);
  });
});
