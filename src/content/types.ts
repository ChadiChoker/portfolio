export type Profile = {
  name: string; title: string; location: string; summary: string; availability: string;
  email: string; phone: string; whatsapp: string; linkedin: string; github: string; cv: string;
  languages: string[];
};
export type Role = { company: string; title: string; start: string; end: string; location: string; bullets: string[]; stack: string[] };
export type Education = { school: string; degree: string; start: string; end: string };
export type Project = {
  slug: string; title: string; tagline: string; problem: string; solution: string;
  architecture: string[]; stack: string[]; highlights: string[];
  repoUrl: string; liveUrl?: string; tags: string[]; featured: boolean;
};
export type Service = { id: string; title: string; pitch: string; deliverables: string[]; stack: string[] };
export type SkillGroup = { group: string; items: string[] };
