import { describe, it, expect } from "vitest";
import { validateChat, MAX_USER_MESSAGES, MAX_CHARS } from "@/lib/chat-guard";

const user = (text: string) => ({ role: "user" as const, parts: [{ type: "text", text }] });
const bot = { role: "assistant" as const, parts: [{ type: "text", text: "ok" }] };

describe("validateChat", () => {
  it("accepts a normal conversation", () => {
    expect(validateChat([user("hi")])).toEqual({ ok: true });
  });
  it("rejects empty / whitespace last message with 400", () => {
    expect(validateChat([user("   ")])).toMatchObject({ ok: false, status: 400 });
    expect(validateChat([])).toMatchObject({ ok: false, status: 400 });
  });
  it("rejects messages over MAX_CHARS with 400", () => {
    expect(validateChat([user("a".repeat(MAX_CHARS + 1))])).toMatchObject({ ok: false, status: 400 });
    expect(validateChat([user("a".repeat(MAX_CHARS))])).toEqual({ ok: true });
  });
  it("rejects the 13th user message with 429", () => {
    const twelve = Array.from({ length: MAX_USER_MESSAGES }, () => [user("q"), bot]).flat();
    expect(validateChat(twelve.slice(0, -1))).toEqual({ ok: true });
    expect(validateChat([...twelve, user("one more")])).toMatchObject({ ok: false, status: 429 });
  });
  it("rejects a non-user last message", () => {
    expect(validateChat([user("hi"), bot])).toMatchObject({ ok: false, status: 400 });
  });
});
