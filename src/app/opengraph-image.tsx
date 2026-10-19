import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${profile.name}, ${profile.title}`;

export default function OG() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#07090c", color: "#e6edf3", backgroundImage: "linear-gradient(#10b98122 1px, transparent 1px), linear-gradient(90deg, #10b98122 1px, transparent 1px)", backgroundSize: "40px 40px" }}>
      <div style={{ color: "#10b981", fontSize: 28, fontFamily: "monospace" }}>● agent online</div>
      <div style={{ fontSize: 88, fontWeight: 800, marginTop: 20 }}>{profile.name}</div>
      <div style={{ fontSize: 40, color: "#8b949e", marginTop: 8 }}>{profile.title}</div>
    </div>,
    size,
  );
}
