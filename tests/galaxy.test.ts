import { describe, it, expect } from "vitest";
import type { BufferAttribute } from "three";
import { createGalaxy } from "@/three/galaxy";

describe("createGalaxy", () => {
  it("builds the requested number of finite points with per-point radius", () => {
    const g = createGalaxy(2000);
    const pos = g.points.geometry.getAttribute("position");
    expect(pos.count).toBe(2000);
    expect(g.points.geometry.getAttribute("aRadius").count).toBe(2000);
    for (let i = 0; i < pos.array.length; i++) expect(Number.isFinite(pos.array[i])).toBe(true);
  });
  it("animates on the GPU: update() only advances uniforms, never rewrites positions", () => {
    const g = createGalaxy(500);
    const pos = g.points.geometry.getAttribute("position") as BufferAttribute;
    const before = Float32Array.from(pos.array);
    const version = pos.version;
    g.update(0.016, 3);
    expect(pos.version).toBe(version);
    expect(Array.from(pos.array)).toEqual(Array.from(before));
    expect(g.material.uniforms.uTime.value).toBe(3);
  });
  it("a pulse sends a wave outward, then settles back to idle", () => {
    const g = createGalaxy(100);
    expect(g.material.uniforms.uWave.value).toBe(-1);
    g.pulse();
    g.update(0.2, 1);
    const front = g.material.uniforms.uWave.value;
    expect(front).toBeGreaterThan(0);
    g.update(0.2, 1);
    expect(g.material.uniforms.uWave.value).toBeGreaterThan(front);
    for (let t = 0; t < 5; t += 0.1) g.update(0.1, 1);
    expect(g.pulsing).toBe(false);
    expect(g.material.uniforms.uWave.value).toBe(-1);
  });
});
