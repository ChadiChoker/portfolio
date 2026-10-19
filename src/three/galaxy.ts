import * as THREE from "three";

// The "latent space": a four-armed spiral of glowing points. Shown on the MacBook display
// during the intro and as the site's living background afterwards. pulse() sends a
// shockwave outward from the core; the agent fires it on every tool call.
// All motion (idle ripple + shockwave) runs in the vertex shader, so the CPU does no per-point work.

const VIOLET = new THREE.Color(0x8b5cf6), CYAN = new THREE.Color(0x22d3ee), EMERALD = new THREE.Color(0x10b981), WHITE = new THREE.Color(0xffffff);
const RADIUS = 4.2;
const WAVE_SPEED = 3.5;

const vertex = /* glsl */ `
  attribute vec3 color;
  attribute float aRadius;
  uniform float uSize; uniform float uPixelRatio; uniform float uTime; uniform float uWave;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec3 p = position;
    p.y += sin(aRadius * 2.0 - uTime * 1.5) * 0.04;
    if (uWave >= 0.0) {
      float d = (aRadius - uWave) * 2.2;
      float lift = exp(-d * d);
      p.y += lift * 0.6;
      vColor += lift * 0.6;
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * uPixelRatio * (8.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const fragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor * a * a, a * uOpacity);
  }`;

export type Galaxy = {
  points: THREE.Points;
  material: THREE.ShaderMaterial;
  update: (dt: number, time: number) => void;
  pulse: () => void;
  readonly pulsing: boolean;
};

export function createGalaxy(count: number): Galaxy {
  const rand = Math.random;
  const pos = new Float32Array(count * 3);
  const radius = new Float32Array(count);
  const col = new Float32Array(count * 3);
  const c = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const r = Math.pow(rand(), 0.7) * RADIUS;
    const ang = ((i % 4) / 4) * Math.PI * 2 + r * 1.25;
    const jitter = () => (rand() - 0.5) * Math.pow(rand(), 2) * (1.2 - r * 0.12);
    pos[i * 3] = Math.cos(ang) * r + jitter();
    pos[i * 3 + 1] = jitter() * 0.6;
    pos[i * 3 + 2] = Math.sin(ang) * r + jitter();
    radius[i] = Math.hypot(pos[i * 3], pos[i * 3 + 2]);
    c.copy(VIOLET).lerp(CYAN, r / RADIUS).lerp(EMERALD, rand() * 0.35);
    if (r < 0.5) c.lerp(WHITE, 0.6);
    col.set([c.r, c.g, c.b], i * 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geometry.setAttribute("aRadius", new THREE.BufferAttribute(radius, 1));
  const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
      uSize: { value: 2.2 }, uPixelRatio: { value: 1 }, uOpacity: { value: 1 },
      uTime: { value: 0 }, uWave: { value: -1 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  const u = material.uniforms;

  return {
    points,
    material,
    get pulsing() { return u.uWave.value >= 0; },
    pulse: () => { u.uWave.value = 0; },
    update(dt, time) {
      points.rotation.y += dt * 0.06;
      u.uTime.value = time;
      if (u.uWave.value >= 0) {
        u.uWave.value += dt * WAVE_SPEED;
        if (u.uWave.value > RADIUS + 1.5) u.uWave.value = -1;
      }
    },
  };
}
