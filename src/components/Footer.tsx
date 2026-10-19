import { profile } from "@/content/profile";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center font-mono text-xs text-muted">
      © {profile.name} · built with Next.js + Claude ·{" "}
      <a href={profile.github} className="hover:text-accent">GitHub</a>
    </footer>
  );
}
