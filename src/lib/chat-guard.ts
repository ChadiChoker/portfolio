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
