"use client";
import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-bg/70 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 font-mono text-sm">
        <Link href="/#top" className="font-semibold text-fg"><span className="text-accent">~/</span>chadi</Link>
        <div className="hidden gap-6 text-muted sm:flex">
          {["services", "projects", "experience", "contact"].map((s) => (
            <Link key={s} href={`/#${s}`} className="hover:text-accent">/{s}</Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => dispatchEvent(new Event("open-palette"))} className="hidden rounded border border-border px-2 py-1 text-[11px] text-muted hover:text-accent sm:block" aria-label="Open command menu">⌘K</button>
          <button onClick={() => dispatchEvent(new Event("open-palette"))} className="rounded border border-border px-3 py-1.5 text-xs text-muted sm:hidden" aria-label="Open menu">menu</button>
          <Link href="/#contact" className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-black">Hire me</Link>
        </div>
      </nav>
    </header>
  );
}
