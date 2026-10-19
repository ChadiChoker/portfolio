"use client";
import { useEffect, useRef } from "react";
import { introStore } from "@/three/intro-store";

// Fixed WebGL backdrop for every page. three.js is imported only after hydration and first
// paint, so it never competes with content. The CSS starfield underneath is the fallback when
// WebGL is unavailable or motion is reduced.
export function World() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let world: { pulse: () => void; dispose: () => void } | undefined;
    let cancelled = false;
    const onTool = () => world?.pulse();
    addEventListener("agent-tool", onTool);

    const start = () => import("@/three/world").then(({ createWorld }) => {
      if (cancelled) return;
      try {
        world = createWorld(canvas, { mobile: matchMedia("(max-width: 768px)").matches });
        canvas.dataset.live = "";
      } catch {
        introStore.failed = true; // no WebGL: the CSS fallback stays and the intro collapses
      }
    }, () => { introStore.failed = true; });
    // Load after first paint, when the main thread is idle. Order relative to Intro does not matter.
    const idle = (cb: () => void) => ("requestIdleCallback" in window ? requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 300));
    const id = idle(start) as number;

    return () => { cancelled = true; if ("cancelIdleCallback" in window) cancelIdleCallback(id); else clearTimeout(id); removeEventListener("agent-tool", onTool); world?.dispose(); };
  }, []);

  return (
    <>
      <div aria-hidden className="world-fallback fixed inset-0 -z-20" />
      <canvas ref={ref} aria-hidden className="world-canvas fixed inset-0 -z-10 h-full w-full" />
    </>
  );
}
