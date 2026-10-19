"use client";
import { useEffect, useRef, useState } from "react";

const FRAG = `precision mediump float;
uniform vec2 r; uniform float t; uniform vec2 m;
void main(){
  vec2 uv = gl_FragCoord.xy / r;
  vec2 g = abs(fract(gl_FragCoord.xy / 28.0) - 0.5);
  float line = smoothstep(0.48, 0.5, max(g.x, g.y));
  float d = distance(uv, m);
  float glow = exp(-d * 3.0) * 0.6 + 0.16;
  float wave = 0.5 + 0.5 * sin(uv.y * 12.0 - t * 0.6 + uv.x * 3.0);
  vec3 c = vec3(0.063, 0.725, 0.506) * line * glow * (0.6 + 0.4 * wave);
  gl_FragColor = vec4(c + vec3(0.027, 0.035, 0.047), 1.0);
}`;
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

export function GridBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl || reduced) { setFallback(true); return; }

    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setFallback(true); return; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, "r"), uT = gl.getUniformLocation(prog, "t"), uM = gl.getUniformLocation(prog, "m");

    let mx = 0.7, my = 0.6, raf = 0;
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    const resize = () => { canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; gl.viewport(0, 0, canvas.width, canvas.height); };
    const move = (e: PointerEvent) => { mx = e.clientX / innerWidth; my = 1 - e.clientY / innerHeight; };
    const frame = (time: number) => {
      gl.uniform2f(uR, canvas.width, canvas.height); gl.uniform1f(uT, time / 1000); gl.uniform2f(uM, mx, my);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(frame);
    };
    resize(); addEventListener("resize", resize); addEventListener("pointermove", move);
    // Start animating once the main thread is idle so the shader never competes with first paint.
    const start = () => { raf = requestAnimationFrame(frame); };
    const idle = "requestIdleCallback" in window ? requestIdleCallback(start, { timeout: 2000 }) : setTimeout(start, 1200);
    return () => {
      if ("cancelIdleCallback" in window) cancelIdleCallback(idle as number); else clearTimeout(idle);
      cancelAnimationFrame(raf); removeEventListener("resize", resize); removeEventListener("pointermove", move);
    };
  }, []);

  return fallback ? (
    <div aria-hidden className="fixed inset-0 -z-10 [background-image:linear-gradient(#10b98114_1px,transparent_1px),linear-gradient(90deg,#10b98114_1px,transparent_1px)] [background-size:28px_28px]" />
  ) : (
    <canvas ref={ref} aria-hidden className="fixed inset-0 -z-10 h-full w-full" />
  );
}
