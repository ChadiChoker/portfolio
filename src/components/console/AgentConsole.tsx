"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ToolLine } from "./ToolLine";
import { ConsoleFrame } from "./ConsoleFrame";
import { scriptedAnswer } from "@/agent/scripted";
import { MAX_USER_MESSAGES, MAX_CHARS } from "@/lib/chat-guard";

type OfflineMsg = { id: string; role: "user" | "assistant"; text: string; tool?: { name: string; args: Record<string, unknown> } | null };

export function AgentConsole({ initialQuestion }: { initialQuestion?: string }) {
  const [input, setInput] = useState("");
  const [offline, setOffline] = useState(false);
  const [offlineMsgs, setOfflineMsgs] = useState<OfflineMsg[]>([]);
  const lastQuestion = useRef("");
  const asked = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function answerOffline(q: string, addUser = true) {
    const r = scriptedAnswer(q);
    if (r.tool) dispatchEvent(new Event("agent-tool"));
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

  // Every new tool call sends a shockwave through the galaxy behind the page.
  const toolCalls = messages.reduce((n, m) => n + m.parts.filter((p) => p.type.startsWith("tool-")).length, 0);
  useEffect(() => {
    if (toolCalls > 0) dispatchEvent(new Event("agent-tool"));
  }, [toolCalls]);

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

  // The loader hands over the visitor's first question once this chunk has loaded.
  useEffect(() => {
    if (initialQuestion && !asked.current) {
      asked.current = true;
      ask(initialQuestion);
      inputRef.current?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ConsoleFrame
      offline={offline} empty={messages.length === 0 && offlineMsgs.length === 0}
      input={input} onInput={setInput} onAsk={ask}
      sendDisabled={!input.trim() || busy || limitReached} inputDisabled={limitReached}
      inputRef={inputRef} scrollerRef={scroller}
    >
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
    </ConsoleFrame>
  );
}
