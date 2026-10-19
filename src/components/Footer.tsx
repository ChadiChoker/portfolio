import { profile } from "@/content/profile";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center font-mono text-xs text-muted">
      © {profile.name} · built with Next.js + Claude ·{" "}
      <a href={profile.github} className="hover:text-accent">GitHub</a>
      <p className="mt-2 text-[10px] text-muted">
        3D model: &ldquo;MacBook Pro M3 16-inch 2024&rdquo; by{" "}
        <a href="https://sketchfab.com/3d-models/macbook-pro-m3-16-inch-2024-8e34fc2b303144f78490007d91ff57c4" className="underline hover:text-accent">jackbaeten</a>
        , <a href="https://creativecommons.org/licenses/by/4.0/" className="underline hover:text-accent">CC BY 4.0</a>, rigged by William Laverty. Not affiliated with Apple Inc.
      </p>
    </footer>
  );
}
