import { projects } from "@/content/projects";
import { experience, education } from "@/content/experience";
import { services } from "@/content/services";
import { profile } from "@/content/profile";

export type ProjectSummary = { slug: string; title: string; tagline: string; stack: string[]; url: string };

const summarize = (p: (typeof projects)[number]): ProjectSummary => ({
  slug: p.slug, title: p.title, tagline: p.tagline, stack: p.stack, url: `/projects/${p.slug}`,
});

export function searchProjects(query: string): ProjectSummary[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return projects.map(summarize);
  const scored = projects
    .map((p) => {
      const hay = [p.slug, p.title, p.tagline, ...p.tags, ...p.stack].join(" ").toLowerCase();
      const words = new Set(hay.split(/[^a-z0-9.+#-]+/));
      const score = terms.reduce((s, t) => s + (words.has(t) ? 2 : hay.includes(t) ? 1 : 0), 0);
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.map((x) => summarize(x.p));
}

export const getProject = (slug: string) => projects.find((p) => p.slug === slug) ?? null;
export const getExperience = () => ({ roles: experience, education });
export const getServices = () => services;
export const getContact = () => ({
  email: profile.email, whatsapp: profile.whatsapp, phone: profile.phone,
  linkedin: profile.linkedin, github: profile.github, cv: profile.cv,
});
