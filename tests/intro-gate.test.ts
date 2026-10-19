import { describe, it, expect } from "vitest";
import { shouldPlayIntro } from "@/three/intro-gate";

const ok = { reducedMotion: false, webgl: true, saveData: false };

describe("shouldPlayIntro", () => {
  it("plays whenever WebGL is available", () => expect(shouldPlayIntro(ok)).toBe(true));
  it("skips under reduced motion", () => expect(shouldPlayIntro({ ...ok, reducedMotion: true })).toBe(false));
  it("skips without WebGL", () => expect(shouldPlayIntro({ ...ok, webgl: false })).toBe(false));
  it("skips when the browser asks to save data", () => expect(shouldPlayIntro({ ...ok, saveData: true })).toBe(false));
  it("has no returning-visitor rule: the reveal always plays", () => {
    // @ts-expect-error `seen` is no longer part of the gate
    expect(shouldPlayIntro({ ...ok, seen: true })).toBe(true);
  });
});
