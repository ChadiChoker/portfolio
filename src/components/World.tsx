"use client";
import { useEffect, useRef } from "react";
import { introStore, subscribeIntro, updateIntro } from "@/three/intro-store";
import { introLight } from "@/three/choreography";
import type { World as WorldApi } from "@/three/world";

type Method = Exclude<keyof WorldApi, "dispose">;

// Fixed WebGL backdrop for every page. All of three.js runs in a Web Worker on an OffscreenCanvas,
// so the main thread only forwards scroll/pointer/resize and never blocks or stutters. Without
// OffscreenCanvas (or under reduced motion) the CSS starfield underneath is what you see.
export function World() {
  const ref = useRef<HTMLCanvasElement>(null);
  const wash = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("transferControlToOffscreen" in canvas)) { updateIntro({ failed: true }); return; }
    // A canvas can be handed to a worker only once; deferring a tick lets React's dev-only
    // mount→unmount→mount cancel the first attempt instead of consuming the canvas.
    let stop = () => {};
    const start = setTimeout(() => { stop = run(canvas, wash.current); }, 0);
    return () => { clearTimeout(start); stop(); };
  }, []);

  return (
    <>
      <div aria-hidden className="world-fallback fixed inset-0 -z-20" />
      <canvas ref={ref} aria-hidden className="world-canvas fixed inset-0 -z-10 h-full w-full" />
      <div ref={wash} aria-hidden className="light-wash pointer-events-none fixed inset-0 -z-[5] opacity-0" />
    </>
  );
}

// Starts the render worker and wires page input to it; returns the teardown.
function run(canvas: HTMLCanvasElement, wash: HTMLDivElement | null) {
  const worker = new Worker(new URL("../three/world.worker.ts", import.meta.url), { type: "module" });
  const call = (method: Method, ...args: unknown[]) => worker.postMessage({ type: "call", method, args });
  worker.onmessage = (e: MessageEvent<{ type: "live" | "ready" | "failed" }>) => {
    if (e.data.type === "live") canvas.dataset.live = "";
    else if (e.data.type === "ready") updateIntro({ ready: true });
    else updateIntro({ failed: true });
  };
  worker.onerror = () => updateIntro({ failed: true });

  const offscreen = canvas.transferControlToOffscreen();
  worker.postMessage(
    { type: "init", canvas: offscreen, opts: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio, mobile: matchMedia("(max-width: 768px)").matches } },
    [offscreen],
  );

  // Input is coalesced to one message batch per frame.
  let queued = 0, px = 0, py = 0;
  const flush = () => {
    queued = 0;
    call("pointer", px, py);
    call("scroll", scrollY, document.documentElement.scrollHeight - innerHeight);
    call("intro", { mode: introStore.mode, progress: introStore.progress, end: introStore.end });
    // the same light curve as the galaxy, as a soft emerald bloom over the page
    if (wash) wash.style.opacity = introStore.mode === "play" ? String(introLight(introStore.progress, scrollY - introStore.end, innerHeight).flash * 0.9) : "0";
  };
  const schedule = () => { if (!queued) queued = requestAnimationFrame(flush); };
  const onPointer = (e: PointerEvent) => { px = e.clientX / innerWidth - 0.5; py = e.clientY / innerHeight - 0.5; schedule(); };
  const onResize = () => { call("resize", innerWidth, innerHeight); schedule(); };
  const onVisibility = () => call("visible", !document.hidden);
  const onTool = () => call("pulse");
  const offIntro = subscribeIntro(schedule);

  addEventListener("pointermove", onPointer, { passive: true });
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", onResize);
  addEventListener("agent-tool", onTool);
  document.addEventListener("visibilitychange", onVisibility);
  schedule();

  return () => {
    cancelAnimationFrame(queued); offIntro();
    removeEventListener("pointermove", onPointer); removeEventListener("scroll", schedule); removeEventListener("resize", onResize);
    removeEventListener("agent-tool", onTool); document.removeEventListener("visibilitychange", onVisibility);
    worker.terminate();
  };
}
