"use client";
import { useEffect, useRef } from "react";

// Fade-up on first scroll into view. Hidden state lives in CSS (globals.css) and
// only applies when scripting is on and motion is allowed, so content never stays invisible.
export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.dataset.shown = ""; io.disconnect(); }
    }, { rootMargin: "0px 0px -80px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} data-reveal className={className} style={delay ? { transitionDelay: `${delay}s` } : undefined}>{children}</div>;
}
