import { describe, it, expect } from "vitest";
import { searchProjects, getProject, getExperience, getServices, getContact } from "@/agent/tools";

describe("agent tools", () => {
  it("searches by tag, stack and title, case-insensitively", () => {
    expect(searchProjects("AI").map((p) => p.slug)).toEqual(expect.arrayContaining(["arcvault", "vehicle-ai", "sadie"]));
    expect(searchProjects("webrtc").map((p) => p.slug)).toEqual(["liu-meet"]);
    expect(searchProjects("spring boot")[0].slug).toBe("sadie");
  });
  it("returns all projects for an empty query and [] for no match", () => {
    expect(searchProjects("  ")).toHaveLength(5);
    expect(searchProjects("blockchain")).toEqual([]);
  });
  it("summaries carry an internal URL", () => {
    expect(searchProjects("arcvault")[0].url).toBe("/projects/arcvault");
  });
  it("gets a project by slug or null", () => {
    expect(getProject("vehicle-ai")?.liveUrl).toBe("https://vehicle-ai-frontend.vercel.app");
    expect(getProject("nope")).toBeNull();
  });
  it("exposes experience, services, contact", () => {
    expect(getExperience().roles).toHaveLength(4);
    expect(getServices()).toHaveLength(4);
    expect(getContact().email).toBe("chadichoker49@gmail.com");
  });
});
