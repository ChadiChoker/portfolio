import type { Role, Education } from "./types";

export const experience: Role[] = [
  {
    company: "Aspire Software", title: "Software & AI Engineer", start: "04/2026", end: "Present", location: "Lebanon",
    bullets: [
      "Develop a production SaaS rental-management platform (Rentall / RentWorks+) across the full stack with React and NestJS.",
      "Integrated LLM-driven functionality (Claude) into core business workflows and backend services.",
      "Designed MCP servers that connect AI agents to internal systems, data and tooling in a controlled, permissioned way.",
      "Established an agentic development workflow with Claude Code: skills, subagents, custom commands, plan mode.",
      "Containerized and deployed services with Docker on AWS.",
    ],
    stack: ["React", "NestJS", "TypeScript", "Claude API", "MCP", "Docker", "AWS"],
  },
  {
    company: "Javelynx", title: "Software Engineer", start: "01/2026", end: "04/2026", location: "Lebanon",
    bullets: [
      "Built cross-platform mobile apps in React Native on top of REST APIs.",
      "Designed Spring Boot backend services, including authentication and scalable endpoints.",
      "Documented APIs with Swagger / OpenAPI and automated build, test and deploy with CI/CD.",
    ],
    stack: ["React Native", "Spring Boot", "Java", "OpenAPI", "Docker", "CI/CD"],
  },
  {
    company: "PROradius", title: "Full-Stack Developer", start: "01/2025", end: "Present", location: "Lebanon",
    bullets: [
      "Built invoice, client and payment workflows for a cloud platform with React and Laravel.",
      "Designed and optimized MySQL queries; reduced regressions through debugging and testing.",
      "Refactored existing modules for maintainability and performance.",
    ],
    stack: ["React", "Laravel", "PHP", "MySQL"],
  },
  {
    company: "JumpCloud", title: "Software Engineer – Level 1", start: "09/2024", end: "02/2025", location: "Lebanon",
    bullets: [
      "Built production backend services and REST APIs with Node.js and Express.",
      "Shipped Vue.js frontend features integrated with backend services.",
      "Contributed to CI/CD, Docker environments and unit/integration tests.",
    ],
    stack: ["Node.js", "Express", "Vue.js", "SQL", "NoSQL", "Docker", "Jest"],
  },
];

export const education: Education[] = [
  { school: "Lebanese International University", degree: "BSc Computer Science", start: "2021", end: "2024" },
];
