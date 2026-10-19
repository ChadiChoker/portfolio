import { describe, it, expect } from "vitest";
import { introPose } from "@/three/choreography";

const keys = ["lidOpen", "turn", "power", "dive", "hud", "handoff"] as const;

describe("introPose", () => {
  it("starts closed, dark and un-dived", () => {
    expect(introPose(0)).toMatchObject({ lidOpen: 0, turn: 0, power: 0, dive: 0, hud: 1, handoff: 0 });
  });
  it("ends fully open, dived in and handed off", () => {
    expect(introPose(1)).toMatchObject({ lidOpen: 1, turn: 1, power: 1, dive: 1, hud: 0, handoff: 1 });
  });
  it("keeps every channel within [0,1], including out-of-range progress", () => {
    for (const p of [-1, -0.1, 0, 0.13, 0.37, 0.5, 0.71, 0.9, 1, 1.4]) {
      const pose = introPose(p);
      for (const k of keys) { expect(pose[k]).toBeGreaterThanOrEqual(0); expect(pose[k]).toBeLessThanOrEqual(1); }
    }
  });
  it("is monotonic: the lid never closes while scrolling forward", () => {
    let prev = introPose(0);
    for (let p = 0.01; p <= 1; p += 0.01) {
      const pose = introPose(p);
      expect(pose.lidOpen).toBeGreaterThanOrEqual(prev.lidOpen);
      expect(pose.dive).toBeGreaterThanOrEqual(prev.dive);
      expect(pose.hud).toBeLessThanOrEqual(prev.hud);
      prev = pose;
    }
  });
  it("powers the screen on only once the lid is mostly open, and dives only after it's fully open", () => {
    const p = [0, 0.2, 0.4].map(introPose);
    expect(p[1].power).toBe(0);
    let firstDive = 1;
    for (let x = 0; x <= 1; x += 0.01) if (introPose(x).dive > 0) { firstDive = x; break; }
    expect(introPose(firstDive).lidOpen).toBe(1);
  });
});

import { sceneBrightness, BG_BRIGHTNESS } from "@/three/choreography";

describe("sceneBrightness", () => {
  const vh = 800;
  it("matches the display (full brightness) through the intro and at the hand-off", () => {
    for (const p of [0, 0.5, 0.9, 1]) expect(sceneBrightness(p, 0, vh)).toBe(1);
  });
  it("never brightens beyond the display: no flash", () => {
    for (let a = 0; a <= 3 * vh; a += 40) expect(sceneBrightness(1, a, vh)).toBeLessThanOrEqual(1);
  });
  it("dims gradually over a long scroll, not like a switch", () => {
    // no single 40px step changes brightness by more than 3%
    let prev = sceneBrightness(1, 0, vh);
    for (let a = 40; a <= 2 * vh; a += 40) { const b = sceneBrightness(1, a, vh); expect(prev - b).toBeLessThan(0.03); expect(b).toBeLessThanOrEqual(prev); prev = b; }
    expect(sceneBrightness(1, 0.5 * vh, vh)).toBeGreaterThan(BG_BRIGHTNESS + 0.1); // still noticeably bright halfway
  });
  it("settles at the background level and stays there", () => {
    expect(sceneBrightness(1, 1.5 * vh, vh)).toBeCloseTo(BG_BRIGHTNESS, 5);
    expect(sceneBrightness(1, 10 * vh, vh)).toBeCloseTo(BG_BRIGHTNESS, 5);
  });
});
