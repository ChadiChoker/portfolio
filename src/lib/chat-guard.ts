export const MAX_USER_MESSAGES = 12;
export const MAX_CHARS = 500;

export type GuardMessage = { role: string; parts?: { type: string; text?: string }[] };
export type GuardResult = { ok: true } | { ok: false; status: 400 | 429; error: string };

const messageText = (m: Pick<GuardMessage, "parts">) =>
  (m.parts ?? []).filter((p) => p.type === "text").map((p) => p.text ?? "").join("");

export function validateChat(messages: GuardMessage[]): GuardResult {
  const last = messages.at(-1);
  if (!last || last.role !== "user") return { ok: false, status: 400, error: "Send a question to start." };
  const text = messageText(last).trim();
  if (!text) return { ok: false, status: 400, error: "Message is empty." };
  if (text.length > MAX_CHARS) return { ok: false, status: 400, error: `Keep it under ${MAX_CHARS} characters.` };
  const userCount = messages.filter((m) => m.role === "user").length;
  if (userCount > MAX_USER_MESSAGES) return { ok: false, status: 429, error: "Chat limit reached." };
  return { ok: true };
}

export const MAX_HISTORY_CHARS = 8000;
export type CleanMessage = { id: string; role: "user" | "assistant"; parts: { type: "text"; text: string }[] };

// The client owns the transcript, so never trust it: rebuild it from plain user/assistant text only
// (no system turns, files or forged tool results), cap each turn, and keep the newest turns that fit the budget.
export function sanitizeHistory(messages: GuardMessage[]): CleanMessage[] {
  const clean: CleanMessage[] = [];
  let budget = MAX_HISTORY_CHARS;
  for (let i = messages.length - 1; i >= 0 && budget > 0; i--) {
    const m = messages[i];
    if (m.role !== "user" && m.role !== "assistant") continue;
    const text = messageText(m).trim().slice(0, m.role === "user" ? MAX_CHARS : 2000).slice(0, budget);
    if (!text) continue;
    budget -= text.length;
    clean.unshift({ id: String(i), role: m.role, parts: [{ type: "text", text }] });
  }
  return clean;
}
