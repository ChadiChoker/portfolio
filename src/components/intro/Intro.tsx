"use client";
import { useEffect, useRef, useState } from "react";
import { introStore, updateIntro } from "@/three/intro-store";
import { shouldPlayIntro } from "@/three/intro-gate";

const BOOT = ["> initializing chadi.ai", "> loading neural weights ........ ok", "> mounting latent space .......... ok", "> agent online"];

// The 3D renders in a worker, so it needs WebGL2 and OffscreenCanvas.
const hasWebGL = () => { try { return "transferControlToOffscreen" in HTMLCanvasElement.prototype && !!document.createElement("canvas").getContext("webgl2"); } catch { return false; } };
const setPhase = (phase: "play" | "done") => { document.documentElement.dataset.intro = phase; };

// Scroll runway for the MacBook intro. The 3D lives in <World/>; this section owns the scroll
// progress, the boot log, and the skip control. Hidden by CSS without JS or under reduced motion.
export function Intro() {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"pending" | "play" | "off">("pending");
  const [boot, setBoot] = useState(1);
  const [booted, setBooted] = useState(false);

  // Only when the 3D can't run (failed or too slow): remove the runway so nobody scrolls through emptiness.
  const collapse = () => {
    updateIntro({ mode: "none", progress: 1, end: 0 });
    setPhase("done"); setState("off");
    scrollTo({ top: 0 });
  };


  useEffect(() => {
    const play = shouldPlayIntro({
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
      webgl: hasWebGL(),
      saveData: !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
    });
    updateIntro({ mode: play ? "play" : "none", progress: play ? 0 : 1 });
    setPhase(play ? "play" : "done");
    // Browser-only facts (WebGL, media queries) can only be read after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(play ? "play" : "off");
    return () => { updateIntro({ mode: "none", progress: 1, end: 0 }); setPhase("done"); };
  }, []);

  // boot log: advances on a timer and finishes once the model is ready. If the 3D fails or
  // isn't ready within 8s, the intro collapses so nobody scrolls through an empty runway.
  useEffect(() => {
    if (state !== "play") return;
    const started = performance.now();
    const id = setInterval(() => {
      const ready = introStore.ready;
      if (introStore.failed || (!ready && performance.now() - started > 8000)) { clearInterval(id); collapse(); return; }
      setBoot((b) => (b < BOOT.length - 1 || ready ? Math.min(b + 1, BOOT.length) : b));
      if (ready && performance.now() - started > 1200) { setBooted(true); clearInterval(id); }
    }, 320);
    return () => clearInterval(id);
  }, [state]);

  // scroll → progress
  useEffect(() => {
    if (state !== "play") return;
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      updateIntro({ progress: p, end: el.offsetTop + el.offsetHeight - innerHeight });
      el.toggleAttribute("data-late", p > 0.8); // skip control is gone for real (not just transparent)
      el.style.setProperty("--p", String(p));
      if (p > 0.97 && document.documentElement.dataset.intro !== "done") setPhase("done");
      else if (p < 0.9 && document.documentElement.dataset.intro === "done") setPhase("play");
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, [state]);

  // Skip is a shortcut, not a removal: jump to where the intro hands off to the page. The intro stays
  // above, so scrolling back up replays it.
  function skip() {
    const el = ref.current;
    if (el) scrollTo({ top: el.offsetTop + el.offsetHeight - innerHeight + 1, behavior: "instant" });
  }

  if (state === "off") return null;

  return (
    <section ref={ref} id="intro" aria-label="Intro" className="intro relative -mt-14 h-[300vh] md:h-[400vh]">
      <div className="sticky top-0 h-dvh">
        <div className={`absolute inset-0 z-40 flex items-center justify-center bg-black transition-opacity duration-700 ${booted ? "pointer-events-none opacity-0" : ""}`}>
          <div className="w-[min(340px,86vw)] font-mono text-[13px] leading-7 text-accent">
            <p className="mb-6 font-sans text-6xl font-bold tracking-tight text-fg">chadi<span className="text-accent">.ai</span></p>
            {/* every line is laid out from the start and revealed in place, so nothing shifts */}
            {BOOT.map((l, i) => <p key={l} className={i < boot ? "" : "invisible"}>{l}</p>)}
            <div className="mt-3 h-0.5 bg-accent/20"><div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${(boot / BOOT.length) * 100}%` }} /></div>
          </div>
        </div>
        {/* moving light line around the screen edge while the MacBook is on stage */}
        <div aria-hidden className="intro-frame intro-frame-glow"><div className="intro-frame-spin" /></div>
        <div aria-hidden className="intro-frame"><div className="intro-frame-spin" /></div>
        <p className="intro-hint absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.3em] text-muted">SCROLL TO OPEN</p>
        <button onClick={skip} className="intro-skip absolute bottom-7 right-5 z-50 rounded-full border border-border bg-black/40 px-3 py-1.5 font-mono text-[11px] text-muted backdrop-blur hover:border-accent hover:text-accent">
          skip intro ↓
        </button>
      </div>
    </section>
  );
}
