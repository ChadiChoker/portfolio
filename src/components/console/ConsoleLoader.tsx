"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { ConsoleFrame } from "./ConsoleFrame";

// The live console (AI SDK, markdown) is the heaviest JS on the page, so it is
// prefetched on hover/focus and only takes over once a question is asked.
const load = () => import("./AgentConsole");
const AgentConsole = dynamic(() => load().then((m) => m.AgentConsole), { ssr: false });

export function ConsoleLoader() {
  const [question, setQuestion] = useState<string | null>(null);
  const [input, setInput] = useState("");

  if (question) return <AgentConsole initialQuestion={question} />;

  return (
    <ConsoleFrame
      empty input={input} onInput={setInput}
      onAsk={(q) => q.trim() && setQuestion(q.trim())}
      onWake={load}
      sendDisabled={!input.trim()}
    />
  );
}
