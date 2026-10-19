import type { Service } from "./types";

export const services: Service[] = [
  { id: "ai-integration", title: "AI Integration", pitch: "Add Claude/LLM features to your existing product: assistants, smart search, summarization, structured extraction.", deliverables: ["LLM feature design + prompts", "Tool use / function calling", "Streaming UI", "Cost + safety guards"], stack: ["Claude API", "Vercel AI SDK", "TypeScript"] },
  { id: "mcp-automation", title: "MCP Servers & AI Automation", pitch: "Connect AI agents to your data and tools safely, and automate workflows end-to-end.", deliverables: ["Custom MCP servers", "Agent workflows", "n8n automations", "Permissioned access to internal systems"], stack: ["MCP", "Node.js", "n8n", "Claude Code"] },
  { id: "fullstack-mvp", title: "Full-Stack MVPs", pitch: "From idea to launched web or mobile app, production-ready from day one.", deliverables: ["Web app (React/Next.js/Vue)", "Mobile app (React Native)", "Auth, payments, admin", "Deployment + CI/CD"], stack: ["React", "Next.js", "React Native", "NestJS"] },
  { id: "apis-backend", title: "APIs & Backend", pitch: "Robust, documented APIs and services that scale.", deliverables: ["REST API design + OpenAPI docs", "Database design + optimization", "Docker + AWS deployment", "Tests"], stack: ["NestJS", "Spring Boot", "Laravel", "PostgreSQL"] },
];
