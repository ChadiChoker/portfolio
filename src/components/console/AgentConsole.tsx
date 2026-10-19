"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ToolLine } from "./ToolLine";
import { scriptedAnswer, SUGGESTED_PROMPTS } from "@/agent/scripted";
import { MAX_USER_MESSAGES, MAX_CHARS } from "@/lib/chat-guard";

type OfflineMsg = { id: string; role: "user" | "assistant"; text: string; tool?: { name: string; args: Record<string, unknown> } | null };

export function AgentConsole() {
  const [input, setInput] = useState("");
  const [offline, setOffline] = useState(false);
  const [offlineMsgs, setOfflineMsgs] = useState<OfflineMsg[]>([]);
  const lastQuestion = useRef("");
  const scroller = useRef<HTMLDivElement>(null);

  function answerOffline(q: string, addUser = true) {
    const r = scriptedAnswer(q);
    setOfflineMsgs((m) => [
      ...m,
      ...(addUser ? [{ id: crypto.randomUUID(), role: "user" as const, text: q }] : []),
      { id: crypto.randomUUID(), role: "assistant" as const, text: r.text, tool: r.tool },
    ]);
  }

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: () => {
      // Missing key, API failure or guard rejection: answer the same question offline.
      setOffline(true);
      answerOffline(lastQuestion.current, false);
    },
  });

  const userCount = messages.filter((m) => m.role === "user").length + offlineMsgs.filter((m) => m.role === "user").length;
  const limitReached = userCount >= MAX_USER_MESSAGES;
  const busy = status === "submitted" || status === "streaming";
  const empty = messages.length === 0 && offlineMsgs.length === 0;

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, offlineMsgs]);

  function ask(q: string) {
    const text = q.trim().slice(0, MAX_CHARS);
    if (!text || busy || limitReached) return;
    lastQuestion.current = text;
    setInput("");
    if (offline) answerOffline(text);
    else sendMessage({ text });
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-panel/90 shadow-[0_0_60px_-20px_#10b981] backdrop-blur">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-[11px] text-muted">
        <span className={`size-2 rounded-full ${offline ? "bg-amber-400" : "animate-pulse bg-accent"}`} />
        chadi-ai {offline ? "· offline mode" : "· online"}
      </div>

      <div ref={scroller} className="max-h-[340px] min-h-[180px] space-y-3 overflow-y-auto px-4 py-3 text-sm" aria-live="polite">
        {empty && <p className="font-mono text-muted">&gt; Ask me anything about Chadi&apos;s work.</p>}
        {messages.map((m) => (
          <div key={m.id}>
            {m.parts.map((part, i) => {
              if (part.type === "text")
                return m.role === "user"
                  ? <p key={i} className="font-mono text-muted">&gt; {part.text}</p>
                  : <div key={i} className="prose-chat"><ReactMarkdown>{part.text}</ReactMarkdown></div>;
              if (part.type.startsWith("tool-")) {
                const p = part as { type: string; state: string; input?: unknown };
                return <ToolLine key={i} name={p.type.slice(5)} args={p.input} done={p.state === "output-available"} />;
              }
              return null;
            })}
          </div>
        ))}
        {offlineMsgs.map((m) => (
          <div key={m.id}>
            {m.role === "user" ? (
              <p className="font-mono text-muted">&gt; {m.text}</p>
            ) : (
              <>
                {m.tool && <ToolLine name={m.tool.name} args={m.tool.args} done />}
                <div className="prose-chat"><ReactMarkdown>{m.text}</ReactMarkdown></div>
              </>
            )}
          </div>
        ))}
        {status === "submitted" && <span className="inline-block h-4 w-2 animate-pulse bg-accent" />}
        {limitReached && (
          <p className="font-mono text-xs text-amber-400">Chat limit reached. Reach Chadi directly at chadichoker49@gmail.com.</p>
        )}
      </div>

      {empty && (
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {SUGGESTED_PROMPTS.map((p) => (
            <button key={p} onClick={() => ask(p)} className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted transition hover:border-accent hover:text-accent">
              {p}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex gap-2 border-t border-border p-3">
        <label htmlFor="agent-input" className="sr-only">Ask Chadi&apos;s AI</label>
        <input
          id="agent-input" value={input} onChange={(e) => setInput(e.target.value)} maxLength={MAX_CHARS}
          disabled={limitReached} placeholder="Ask about my work or hiring…" autoComplete="off"
          className="min-w-0 flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted/60"
        />
        <button type="submit" disabled={!input.trim() || busy || limitReached}
          className="rounded-md bg-accent px-3 py-1 font-mono text-xs font-semibold text-black disabled:opacity-40">
          Send ↵
        </button>
      </form>
    </div>
  );
}
