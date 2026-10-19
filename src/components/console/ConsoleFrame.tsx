"use client";
import type { ReactNode, RefObject } from "react";
import { SUGGESTED_PROMPTS } from "@/agent/prompts";
import { MAX_CHARS } from "@/lib/chat-guard";

// Presentational shell shared by the lightweight loader and the live console,
// so the hero looks identical before and after the chat engine loads.
type Props = {
  offline?: boolean;
  empty: boolean;
  children?: ReactNode;
  input: string;
  onInput: (v: string) => void;
  onAsk: (q: string) => void;
  onWake?: () => void;
  sendDisabled: boolean;
  inputDisabled?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  scrollerRef?: RefObject<HTMLDivElement | null>;
};

export function ConsoleFrame({ offline, empty, children, input, onInput, onAsk, onWake, sendDisabled, inputDisabled, inputRef, scrollerRef }: Props) {
  return (
    <div onPointerEnter={onWake} onTouchStart={onWake}
      className="card accent-emerald console-glass">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-[11px] text-muted">
        <span className={`size-2 rounded-full ${offline ? "bg-amber-400" : "animate-pulse bg-accent"}`} />
        chadi-ai {offline ? "· offline mode" : "· online"}
      </div>

      <div ref={scrollerRef} className="max-h-[340px] min-h-[180px] space-y-3 overflow-y-auto px-4 py-3 text-sm" aria-live="polite">
        {empty && <p className="font-mono text-muted">&gt; Ask me anything about Chadi&apos;s work.</p>}
        {children}
      </div>

      {empty && (
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {SUGGESTED_PROMPTS.map((p) => (
            <button key={p} onClick={() => onAsk(p)} className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted transition hover:border-accent hover:text-accent">
              {p}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); onAsk(input); }} className="flex gap-2 border-t border-border p-3">
        <label htmlFor="agent-input" className="sr-only">Ask Chadi&apos;s AI</label>
        <input
          id="agent-input" ref={inputRef} value={input} onChange={(e) => onInput(e.target.value)} onFocus={onWake} maxLength={MAX_CHARS}
          disabled={inputDisabled} placeholder="Ask about my work or a project…" autoComplete="off"
          className="min-w-0 flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted/60"
        />
        <button type="submit" disabled={sendDisabled}
          className="rounded-md bg-accent px-3 py-1 font-mono text-xs font-semibold text-black disabled:opacity-40">
          Send ↵
        </button>
      </form>
    </div>
  );
}
