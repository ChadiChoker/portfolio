import { describe, it, expect } from "vitest";
import { projects } from "@/content/projects";
import { services } from "@/content/services";
import { experience } from "@/content/experience";
import { profile } from "@/content/profile";

describe("content", () => {
  it("has 5 projects with unique slugs and required fields", () => {
    expect(projects).toHaveLength(5);
    expect(new Set(projects.map((p) => p.slug)).size).toBe(5);
    for (const p of projects) {
      expect(p.title && p.tagline && p.problem && p.solution).toBeTruthy();
      expect(p.stack.length).toBeGreaterThan(0);
      expect(p.repoUrl).toMatch(/^https:\/\/github\.com\/ChadiChoker\//);
    }
  });
  it("has 4 services", () => expect(services).toHaveLength(4));
  it("lists experience newest first", () => {
    expect(experience[0].company).toBe("Aspire Software");
    expect(experience.map((r) => r.company)).toEqual(["Aspire Software", "Javelynx", "PROradius", "JumpCloud"]);
  });
  it("has contact details", () => {
    expect(profile.email).toBe("chadichoker49@gmail.com");
    expect(profile.whatsapp).toMatch(/^https:\/\/wa\.me\/96181410706$/);
  });
});
