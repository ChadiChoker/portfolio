"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CommandPalette = dynamic(() => import("./CommandPalette").then((m) => m.CommandPalette), { ssr: false });

// cmdk only loads the first time the palette is opened (⌘K / Ctrl+K or the nav buttons).
export function CommandPaletteLoader() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setLoaded(true); }
    };
    const onOpen = () => setLoaded(true);
    addEventListener("keydown", onKey); addEventListener("open-palette", onOpen);
    return () => { removeEventListener("keydown", onKey); removeEventListener("open-palette", onOpen); };
  }, [loaded]);

  return loaded ? <CommandPalette defaultOpen /> : null;
}
