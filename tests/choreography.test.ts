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
