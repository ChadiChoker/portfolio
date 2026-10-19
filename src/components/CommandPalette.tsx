"use client";
import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { projects } from "@/content/projects";
import { profile } from "@/content/profile";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
    };
    const onOpen = () => setOpen(true);
    addEventListener("keydown", onKey); addEventListener("open-palette", onOpen);
    return () => { removeEventListener("keydown", onKey); removeEventListener("open-palette", onOpen); };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    if (href.startsWith("http") || href.endsWith(".pdf")) window.open(href, "_blank");
    else router.push(href);
  };
  const item = "flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm text-fg aria-selected:bg-accent/15 aria-selected:text-accent";
  const group = "px-1 py-1 text-[11px] text-muted [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1";

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Command menu"
      className="fixed left-1/2 top-[20vh] z-50 w-[min(560px,92vw)] -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-panel font-mono shadow-2xl"
      overlayClassName="fixed inset-0 z-40 bg-black/60">
      <Command.Input placeholder="Type a command…" className="w-full border-b border-border bg-transparent px-4 py-3 text-sm text-fg outline-none" />
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="px-3 py-2 text-sm text-amber-400">command not found</Command.Empty>
        <Command.Group heading="Navigate" className={group}>
          {["services", "projects", "experience", "stack", "contact"].map((s) => (
            <Command.Item key={s} className={item} onSelect={() => go(`/#${s}`)}>/{s}</Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Projects" className={group}>
          {projects.map((p) => <Command.Item key={p.slug} className={item} onSelect={() => go(`/projects/${p.slug}`)}>{p.title}</Command.Item>)}
        </Command.Group>
        <Command.Group heading="Contact" className={group}>
          <Command.Item className={item} onSelect={() => { navigator.clipboard.writeText(profile.email); setOpen(false); }}>Copy email</Command.Item>
          <Command.Item className={item} onSelect={() => go(profile.whatsapp)}>WhatsApp</Command.Item>
          <Command.Item className={item} onSelect={() => go(profile.github)}>GitHub</Command.Item>
          <Command.Item className={item} onSelect={() => go(profile.linkedin)}>LinkedIn</Command.Item>
          <Command.Item className={item} onSelect={() => go(profile.cv)}>Download CV</Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
