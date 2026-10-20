import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home-screen icon: the same "C" + cursor monogram as icon.svg, on a solid tile (iOS adds its own rounding).
export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#05070c" }}>
      <svg width="150" height="150" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#10b981" /><stop offset=".6" stopColor="#22d3ee" /><stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <path d="M41 21.5a13 13 0 1 0 0 21" fill="none" stroke="url(#g)" strokeWidth="7" strokeLinecap="round" />
        <rect x="44" y="38" width="7" height="7" rx="1.5" fill="#10b981" />
      </svg>
    </div>,
    size,
  );
}
