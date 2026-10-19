import Link from "next/link";
import { profile } from "@/content/profile";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center font-mono text-xs text-muted">
      © {profile.name} · <Link href="/credits" className="hover:text-accent">credits</Link>
    </footer>
  );
}
