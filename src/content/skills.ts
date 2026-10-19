import type { SkillGroup } from "./types";

export const skills: SkillGroup[] = [
  { group: "AI & Agents", items: ["Claude API", "Tool use", "Structured outputs", "MCP servers", "Claude Code", "Prompt engineering", "n8n"] },
  { group: "Frontend & Mobile", items: ["React", "Next.js", "Vue.js", "React Native", "TypeScript", "Tailwind CSS"] },
  { group: "Backend", items: ["NestJS", "Node.js", "Express", "Spring Boot", "Laravel"] },
  { group: "Data", items: ["PostgreSQL", "MySQL", "MongoDB"] },
  { group: "Cloud & DevOps", items: ["AWS", "Docker", "CI/CD", "Linux", "Git"] },
  { group: "Quality & Security", items: ["Jest", "Swagger / OpenAPI", "JWT", "OAuth 2.0", "RBAC"] },
];
