"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type Link = { x1: number; y1: number; x2: number; y2: number; a: string; b: string };

// Wraps a grid of cards and links neighbours like stars in a constellation: a glowing node on each
// facing edge and a light line across the gap, tinted from one card's accent to the other's.
// Positions come from offsetLeft/Top (ignoring reveal transforms) and refresh on resize.
export function Constellation({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const uid = useId().replace(/:/g, ""); // gradient ids must be unique per constellation on the page

  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    const measure = () => {
      const items = [...grid.children].filter((el): el is HTMLElement => el instanceof HTMLElement && !el.dataset.constellation);
      const boxes = items.map((el) => {
        const card = el.querySelector<HTMLElement>(".card") ?? el;
        return { l: el.offsetLeft, t: el.offsetTop, r: el.offsetLeft + el.offsetWidth, b: el.offsetTop + el.offsetHeight, accent: getComputedStyle(card).getPropertyValue("--accent").trim() || "#10b981" };
      });
      const next: Link[] = [];
      boxes.forEach((p, i) => {
        // nearest card to the right in the same row
        const right = boxes.filter((q, j) => j !== i && Math.abs(q.t - p.t) < 12 && q.l > p.r - 1).sort((x, y) => x.l - y.l)[0];
        if (right) { const y = (Math.max(p.t, right.t) + Math.min(p.b, right.b)) / 2; next.push({ x1: p.r, y1: y, x2: right.l, y2: y, a: p.accent, b: right.accent }); }
        // nearest card below that overlaps horizontally
        const below = boxes.filter((q, j) => j !== i && q.t > p.b - 1 && q.l < p.r && q.r > p.l).sort((x, y) => x.t - y.t || Math.abs(x.l - p.l) - Math.abs(y.l - p.l))[0];
        if (below) { const x = (Math.max(p.l, below.l) + Math.min(p.r, below.r)) / 2; next.push({ x1: x, y1: p.b, x2: x, y2: below.t, a: p.accent, b: below.accent }); }
      });
      setLinks(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(grid);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {children}
      <svg data-constellation="" aria-hidden className="constellation pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible">
        <defs>
          {links.map((k, i) => (
            <linearGradient key={i} id={`${uid}-${i}`} gradientUnits="userSpaceOnUse" x1={k.x1} y1={k.y1} x2={k.x2} y2={k.y2}>
              <stop offset="0" stopColor={k.a} /><stop offset="1" stopColor={k.b} />
            </linearGradient>
          ))}
        </defs>
        {links.map((k, i) => (
          <g key={i}>
            <line x1={k.x1} y1={k.y1} x2={k.x2} y2={k.y2} stroke={`url(#${uid}-${i})`} strokeWidth="1" opacity=".55" />
            <line className="constellation-pulse" pathLength={100} x1={k.x1} y1={k.y1} x2={k.x2} y2={k.y2} stroke={`url(#${uid}-${i})`} strokeWidth="2" strokeLinecap="round" style={{ animationDelay: `${(i % 5) * 0.7}s` }} />
            <circle cx={k.x1} cy={k.y1} r="7" fill={k.a} opacity=".16" />
            <circle cx={k.x2} cy={k.y2} r="7" fill={k.b} opacity=".16" />
            <circle className="constellation-node" cx={k.x1} cy={k.y1} r="2.5" fill={k.a} style={{ animationDelay: `${(i % 4) * 0.9}s` }} />
            <circle className="constellation-node" cx={k.x2} cy={k.y2} r="2.5" fill={k.b} style={{ animationDelay: `${(i % 4) * 0.9 + 0.45}s` }} />
          </g>
        ))}
      </svg>
    </div>
  );
}
