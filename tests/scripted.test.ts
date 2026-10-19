import { describe, it, expect } from "vitest";
import { scriptedAnswer, SUGGESTED_PROMPTS } from "@/agent/scripted";

describe("scriptedAnswer", () => {
  it("routes a named project to get_project", () => {
    const r = scriptedAnswer("Tell me about LIU Meet");
    expect(r.tool).toEqual({ name: "get_project", args: { slug: "liu-meet" } });
    expect(r.text).toContain("WebRTC");
  });
  it("routes AI work to search_projects", () => {
    const r = scriptedAnswer("What AI work has he shipped?");
    expect(r.tool?.name).toBe("search_projects");
    expect(r.text).toContain("ArcVault");
  });
  it("routes experience questions", () => {
    expect(scriptedAnswer("where has he worked?").tool?.name).toBe("get_experience");
  });
  it("routes hiring / services questions", () => {
    expect(scriptedAnswer("can I hire him for an MVP?").tool?.name).toBe("get_services");
  });
  it("routes contact questions", () => {
    const r = scriptedAnswer("how do I reach him?");
    expect(r.tool?.name).toBe("get_contact");
    expect(r.text).toContain("chadichoker49@gmail.com");
  });
  it("redirects off-topic questions, never empty", () => {
    const r = scriptedAnswer("what's the weather?");
    expect(r.tool).toBeNull();
    expect(r.text.length).toBeGreaterThan(20);
    expect(r.text).toContain(SUGGESTED_PROMPTS[0]);
  });
  it("answers every suggested prompt with a tool", () => {
    for (const p of SUGGESTED_PROMPTS) expect(scriptedAnswer(p).tool).not.toBeNull();
  });
  it("does not treat 'ai' inside 'Chadi' or 'email' as an AI question", () => {
    expect(scriptedAnswer("does chadi like cats?").tool).toBeNull();
  });
});
