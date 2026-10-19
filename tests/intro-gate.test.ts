import { describe, it, expect } from "vitest";
import { shouldPlayIntro } from "@/three/intro-gate";

const ok = { reducedMotion: false, webgl: true, seen: false, saveData: false };

describe("shouldPlayIntro", () => {
  it("plays for a first-time visitor with WebGL", () => expect(shouldPlayIntro(ok)).toBe(true));
  it("skips under reduced motion", () => expect(shouldPlayIntro({ ...ok, reducedMotion: true })).toBe(false));
  it("skips without WebGL", () => expect(shouldPlayIntro({ ...ok, webgl: false })).toBe(false));
  it("skips for returning visitors", () => expect(shouldPlayIntro({ ...ok, seen: true })).toBe(false));
  it("skips when the browser asks to save data", () => expect(shouldPlayIntro({ ...ok, saveData: true })).toBe(false));
});
