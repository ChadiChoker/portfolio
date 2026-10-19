import { searchProjects, getProject, getExperience, getServices, getContact } from "./tools";
import { projects } from "@/content/projects";

export type ScriptedReply = { tool: { name: string; args: Record<string, unknown> } | null; text: string };

export const SUGGESTED_PROMPTS = [
  "What AI work has Chadi shipped?",
  "Can he build an MCP server for my product?",
  "How do I contact him?",
];

// Whole-word match, so "ai" doesn't hit "chadi" or "email".
const has = (q: string, words: string[]) => words.some((w) => new RegExp(`\\b${w}\\b`).test(q));

export function scriptedAnswer(question: string): ScriptedReply {
  const q = question.toLowerCase();

  const named = projects.find((p) => q.includes(p.slug.replace("-", " ")) || q.includes(p.title.toLowerCase().split(/[:\s]/)[0]));
  if (named) {
    const p = getProject(named.slug)!;
    return {
      tool: { name: "get_project", args: { slug: p.slug } },
      text: `**${p.title}**: ${p.tagline}\n\n${p.solution}\n\nStack: ${p.stack.join(", ")}. [Read the case study](/projects/${p.slug})`,
    };
  }
  if (has(q, ["contact", "email", "reach", "whatsapp", "call", "phone"])) {
    const c = getContact();
    return { tool: { name: "get_contact", args: {} }, text: `Email **${c.email}** or message on [WhatsApp](${c.whatsapp}). You can also [download the CV](${c.cv}).` };
  }
  if (has(q, ["hire", "service", "services", "freelance", "price", "cost", "offer", "mvp", "build", "mcp"])) {
    const list = getServices().map((s) => `- **${s.title}**: ${s.pitch}`).join("\n");
    return { tool: { name: "get_services", args: {} }, text: `Chadi takes freelance work in:\n\n${list}\n\nTell him about your project at **chadichoker49@gmail.com**.` };
  }
  if (has(q, ["experience", "worked", "job", "jobs", "company", "companies", "career", "years"])) {
    const roles = getExperience().roles.map((r) => `- **${r.title}**, ${r.company} (${r.start}–${r.end})`).join("\n");
    return { tool: { name: "get_experience", args: {} }, text: `About 2 years of production experience:\n\n${roles}` };
  }
  if (has(q, ["project", "projects", "built", "shipped", "portfolio", "ai", "llm", "agent", "agents", "work"])) {
    const query = has(q, ["ai", "llm", "agent", "agents"]) ? "ai" : "";
    const list = searchProjects(query).map((p) => `- [${p.title}](${p.url}): ${p.tagline}`).join("\n");
    return { tool: { name: "search_projects", args: { query } }, text: `Here's what Chadi has built:\n\n${list}` };
  }
  return {
    tool: null,
    text: `I'm Chadi's portfolio assistant, so I stick to his work. Try asking:\n\n${SUGGESTED_PROMPTS.map((p) => `- ${p}`).join("\n")}`,
  };
}
