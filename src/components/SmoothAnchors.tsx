"use client";
import { useEffect } from "react";

// In-page links (/#services, #contact…) glide smoothly. This is deliberately NOT a global
// `scroll-behavior: smooth`: that also animates the browser's back/forward scroll restore,
// which would replay the whole intro on the way back down.
export function SmoothAnchors() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!el) return;
      e.preventDefault();
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      history.pushState(history.state, "", url.hash);
    };
    addEventListener("click", onClick, true); // capture: runs before Next's Link handler
    return () => removeEventListener("click", onClick, true);
  }, []);
  return null;
}
