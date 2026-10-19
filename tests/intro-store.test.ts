import { describe, it, expect, vi } from "vitest";
import { introStore, updateIntro, subscribeIntro } from "@/three/intro-store";

describe("intro store", () => {
  it("merges updates and notifies subscribers once per change", () => {
    const fn = vi.fn();
    const off = subscribeIntro(fn);
    updateIntro({ mode: "play", progress: 0.3 });
    expect(introStore).toMatchObject({ mode: "play", progress: 0.3 });
    expect(fn).toHaveBeenCalledTimes(1);
    updateIntro({ progress: 0.3 }); // no change → no notification
    expect(fn).toHaveBeenCalledTimes(1);
    off();
    updateIntro({ progress: 0.5 });
    expect(fn).toHaveBeenCalledTimes(1);
    updateIntro({ mode: "none", progress: 1 });
  });
});
