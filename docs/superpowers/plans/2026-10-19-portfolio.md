# Chadi Choker Portfolio: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dark "Agent Console" portfolio for Chadi Choker. Its hero is a live Claude agent that answers questions about his work, with a scripted fallback. Ship it to his personal GitHub along with a profile makeover.

**Architecture:** Next.js App Router site. All facts live in typed `src/content/*` modules. Pure functions in `src/agent/tools.ts` query that content and serve three consumers: the AI SDK tools in `/api/chat`, the scripted fallback, and the pages. The client console uses `useChat`. If the route returns non-2xx or errors, the console switches to the scripted mode.

**Tech Stack:**
- Next.js 16 and React 19
- TypeScript (strict)
- Tailwind CSS v4
- `ai@7`, `@ai-sdk/react@4`, `@ai-sdk/anthropic@4`, `zod@4`
- `motion`, `cmdk`, `react-markdown`
- Vitest 5

**Spec:** `docs/superpowers/specs/2026-10-19-portfolio-design.md`

## Global Constraints

- **Model:** `claude-haiku-5-5`. The API key comes from the `ANTHROPIC_API_KEY` server env var only. It is never `NEXT_PUBLIC_`.
- **Site URL:** from `NEXT_PUBLIC_SITE_URL`, default `http://localhost:3000`. No domain is hardcoded.
- **Chat limits:** at most 12 user messages per conversation, at most 500 characters per message, `maxOutputTokens: 600`, `stopWhen: stepCountIs(4)`.
- **Look:** dark only. Accent emerald `#10b981`, background `#07090c`. Monospace for console and labels.
- **Copy:** never mention work-internal details beyond the CV. Aspire Software is described only by its CV bullets.
- **Git identity (repo-local):** `Chadi Choker <135199733+ChadiChoker@users.noreply.github.com>`. Remote: `git@github-personal:ChadiChoker/portfolio.git`. Never touch the global git config or the work `gh` login.
- **Commit trailer:** every commit ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Motion:** honour `prefers-reduced-motion`, which disables WebGL and entrance animations.
- **AI SDK v7 note:** `convertToModelMessages` is **async**, so always `await` it.

## Review Focus

1. **Empty or whitespace-only message:** the console's send button is disabled, and the server returns 400 if one arrives.
2. **The 13th user message:** the client shows a "limit reached, contact Chadi directly" line, and the server returns 429.
3. **Missing key or API failure in the middle of a conversation:** the console switches to offline mode, answers the same question with the scripted engine, and shows the "offline mode" label. No raw error text is ever shown.
4. **A question that matches nothing** (for example "what's the weather?"): the agent and the scripted engine both redirect to Chadi's work and suggest prompts. They never return an empty bubble.
5. **Unknown project slug** (`/projects/nope`): the terminal-styled 404 page is shown with a link home.

---

## File map

```
src/
  content/profile.ts        profile + contact facts
  content/experience.ts     roles + education
  content/projects.ts       5 case studies
  content/services.ts       4 freelance services
  content/skills.ts         grouped skills
  content/types.ts          shared content types
  agent/tools.ts            pure query functions over content
  agent/ai-tools.ts         AI SDK tool() wrappers
  agent/system-prompt.ts    system prompt builder
  agent/scripted.ts         offline keyword answer engine
  lib/chat-guard.ts         message validation (shared client/server)
  app/api/chat/route.ts     streaming agent endpoint
  app/layout.tsx            fonts, metadata, background, nav, palette, JSON-LD
  app/page.tsx              home: hero + sections
  app/projects/[slug]/page.tsx  case studies
  app/not-found.tsx         terminal 404
  app/sitemap.ts, app/robots.ts, app/opengraph-image.tsx
  app/globals.css           Tailwind v4 + theme tokens
  components/console/AgentConsole.tsx   chat UI
  components/console/ToolLine.tsx       "⚙ tool: name(args)" line
  components/GridBackground.tsx         WebGL grid + CSS fallback
  components/Nav.tsx, Footer.tsx, CommandPalette.tsx
  components/sections/Services.tsx, Projects.tsx, Experience.tsx, Stack.tsx, Contact.tsx
tests/
  content.test.ts, tools.test.ts, scripted.test.ts, chat-guard.test.ts
public/Chadi_Choker_CV.pdf
```

---

### Task 1: Scaffold the project

**Files:**
- Create: Next.js scaffold, `vitest.config.ts`, `src/app/globals.css`, `public/Chadi_Choker_CV.pdf`
- Modify: `.gitignore` (keep the `.superpowers/` line)

**Interfaces:**
- Produces: a working `npm run dev`, `npm test` and `npm run build`. CSS tokens `--bg`, `--fg`, `--muted`, `--accent`, `--panel`, `--border`. Font CSS vars `--font-sans` and `--font-mono`.

- [ ] **Step 1: Scaffold into the existing repo.**

```bash
cd ~/Projects/portfolio
npx create-next-app@16 tmp-app --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack --yes
rsync -a tmp-app/ ./ --exclude .git --exclude .gitignore && cat tmp-app/.gitignore >> .gitignore && rm -rf tmp-app
npm i ai@7 @ai-sdk/react@4 @ai-sdk/anthropic@4 zod@4 motion cmdk react-markdown
npm i -D vitest@5
cp "$HOME/Downloads/Chadi_Choker_CV 2.pdf" public/Chadi_Choker_CV.pdf
```

- [ ] **Step 2: Add the test script and Vitest config.**

In `package.json`, add `"test": "vitest run"` under `scripts`.

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: { include: ["tests/**/*.test.ts"] },
});
```

- [ ] **Step 3: Replace `src/app/globals.css` with the theme tokens.**

```css
@import "tailwindcss";

@theme {
  --color-bg: #07090c;
  --color-panel: #0d1117;
  --color-border: #21262d;
  --color-fg: #e6edf3;
  --color-muted: #8b949e;
  --color-accent: #10b981;
  --font-sans: var(--font-geist-sans), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, Menlo, monospace;
}

html { background: var(--color-bg); color: var(--color-fg); color-scheme: dark; scroll-behavior: smooth; }
body { font-family: var(--font-sans); min-height: 100dvh; }
::selection { background: var(--color-accent); color: #000; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } *, *::before, *::after { animation: none !important; transition: none !important; } }
```

- [ ] **Step 4: Verify.**

Run `npm run build`. Expected: build succeeds.

Run `npx vitest run --passWithNoTests`. Expected: exit 0.

- [ ] **Step 5: Commit.**

```bash
git add -A && git commit -m "chore: scaffold Next.js 16 + Tailwind v4 + Vitest

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Content modules

**Files:**
- Create: `src/content/types.ts`, `profile.ts`, `experience.ts`, `projects.ts`, `services.ts`, `skills.ts`
- Test: `tests/content.test.ts`

**Interfaces:**
- Produces:
  - `profile: Profile`
  - `experience: Role[]`
  - `education: Education[]`
  - `projects: Project[]`
  - `services: Service[]`
  - `skills: SkillGroup[]`

- [ ] **Step 1: Write the failing test.** `tests/content.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it and confirm it fails.**

Run `npm test`. Expected: FAIL with `Cannot find module '@/content/projects'`.

- [ ] **Step 3: Write the content.**

`src/content/types.ts`:

```ts
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
```

`src/content/profile.ts`:

```ts
import type { Profile } from "./types";

export const profile: Profile = {
  name: "Chadi Choker",
  title: "Software & AI Product Engineer",
  location: "Lebanon · Remote worldwide",
  summary:
    "I build production web and mobile apps across the full stack, and I wire AI into them: LLM features, MCP servers that connect agents to real systems, and agentic workflows that ship faster.",
  availability: "Available for freelance projects",
  email: "chadichoker49@gmail.com",
  phone: "+961 81 410 706",
  whatsapp: "https://wa.me/96181410706",
  linkedin: "https://www.linkedin.com/in/chadi-choker-592371295",
  github: "https://github.com/ChadiChoker",
  cv: "/Chadi_Choker_CV.pdf",
  languages: ["Arabic", "English", "French"],
};
```

`src/content/experience.ts`:

```ts
import type { Role, Education } from "./types";

export const experience: Role[] = [
  {
    company: "Aspire Software", title: "Software & AI Product Engineer", start: "04/2026", end: "Present", location: "Lebanon",
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
```

`src/content/projects.ts`:

```ts
import type { Project } from "./types";

const gh = (repo: string) => `https://github.com/ChadiChoker/${repo}`;

export const projects: Project[] = [
  {
    slug: "arcvault", title: "ArcVault AI Intake & Triage", tagline: "LLM pipeline that classifies, enriches and routes inbound requests.",
    problem: "Inbound support and sales requests arrive unstructured, and triaging them by hand is slow and inconsistent.",
    solution: "A self-hosted n8n workflow that sends each request through Llama 3.3 70B on Groq to classify intent, extract entities, score urgency and route structured JSON downstream.",
    architecture: ["Webhook trigger in n8n", "Groq Llama 3.3 70B for classification + enrichment with structured JSON prompts", "Validation + routing nodes", "Structured output delivered to a webhook destination"],
    stack: ["n8n", "Groq", "Llama 3.3 70B", "Prompt engineering", "JSON schemas"],
    highlights: ["Deterministic structured outputs from an LLM", "Documented prompts and architecture write-up", "Importable, reproducible workflow"],
    repoUrl: gh("arcvault-pipeline"), tags: ["ai", "llm", "automation", "n8n"], featured: true,
  },
  {
    slug: "vehicle-ai", title: "Vehicle AI Inspection", tagline: "Upload car photos, get AI-detected damage reports.",
    problem: "Vehicle inspections are manual, slow and hard to standardize across inspectors.",
    solution: "A REST API that accepts inspection photos, runs AI damage detection and returns structured results, with a React + TypeScript frontend to run inspections and review reports.",
    architecture: ["Node.js REST API with photo uploads", "AI damage-detection step returning structured findings", "Swagger docs, Docker image and CI pipeline with automated tests", "React + TypeScript (Vite) frontend on Vercel"],
    stack: ["Node.js", "Express", "React", "TypeScript", "Docker", "Swagger", "CI"],
    highlights: ["End-to-end AI feature from upload to report", "Tested, containerized, CI-built backend", "Live frontend demo"],
    repoUrl: gh("vehicle-ai-backend"), liveUrl: "https://vehicle-ai-frontend.vercel.app", tags: ["ai", "computer-vision", "fullstack"], featured: true,
  },
  {
    slug: "sadie", title: "SADIE: AI Call Activity Platform", tagline: "Webhook receiver + dashboard for AI phone-call events.",
    problem: "An AI calling system emits a stream of call events that the business couldn't see or query.",
    solution: "A Spring Boot service that receives, validates and stores AI call webhooks in Postgres, and a React + TypeScript dashboard to explore call activity.",
    architecture: ["Spring Boot 3 webhook receiver (Java 17)", "PostgreSQL 15 with Flyway migrations and Spring Data JPA", "React 18 + TypeScript + Vite dashboard with React Router"],
    stack: ["Java", "Spring Boot", "PostgreSQL", "Flyway", "React", "TypeScript"],
    highlights: ["Idempotent webhook ingestion", "Versioned schema migrations", "Typed dashboard over a REST API"],
    repoUrl: gh("sadie-webhook-backend"), tags: ["ai", "backend", "dashboard"], featured: true,
  },
  {
    slug: "liu-meet", title: "LIU Meet", tagline: "Group video calling built on WebRTC.",
    problem: "Students needed a lightweight, self-hosted group video call app.",
    solution: "A Laravel + React app that signals peers over WebSockets and streams audio/video peer-to-peer with WebRTC.",
    architecture: ["Laravel backend + MySQL", "WebSocket signaling server", "React client with WebRTC peer connections", "Nginx deployment"],
    stack: ["Laravel", "PHP", "React", "WebRTC", "WebSockets", "MySQL"],
    highlights: ["Real-time multi-peer media", "Custom signaling layer"],
    repoUrl: gh("liu-meet"), tags: ["realtime", "webrtc", "fullstack"], featured: true,
  },
  {
    slug: "classifieds-api", title: "Classifieds API", tagline: "OLX-style ads API with dynamic per-category fields.",
    problem: "Each ad category (cars, real estate, phones) needs different fields without schema changes per category.",
    solution: "A Laravel API where categories define their own field schemas, and ads are validated against them dynamically.",
    architecture: ["Laravel REST API", "Category-defined dynamic field schemas + validation", "MySQL/PostgreSQL", "Docker Compose setup"],
    stack: ["Laravel", "PHP", "MySQL", "PostgreSQL", "Docker"],
    highlights: ["Flexible schema without migrations per category", "Dockerized dev environment"],
    repoUrl: gh("hassanzeaiter"), tags: ["backend", "api"], featured: true,
  },
];
```

`src/content/services.ts`:

```ts
import type { Service } from "./types";

export const services: Service[] = [
  { id: "ai-integration", title: "AI Integration", pitch: "Add Claude/LLM features to your existing product: assistants, smart search, summarization, structured extraction.", deliverables: ["LLM feature design + prompts", "Tool use / function calling", "Streaming UI", "Cost + safety guards"], stack: ["Claude API", "Vercel AI SDK", "TypeScript"] },
  { id: "mcp-automation", title: "MCP Servers & AI Automation", pitch: "Connect AI agents to your data and tools safely, and automate workflows end-to-end.", deliverables: ["Custom MCP servers", "Agent workflows", "n8n automations", "Permissioned access to internal systems"], stack: ["MCP", "Node.js", "n8n", "Claude Code"] },
  { id: "fullstack-mvp", title: "Full-Stack MVPs", pitch: "From idea to launched web or mobile app, production-ready from day one.", deliverables: ["Web app (React/Next.js/Vue)", "Mobile app (React Native)", "Auth, payments, admin", "Deployment + CI/CD"], stack: ["React", "Next.js", "React Native", "NestJS"] },
  { id: "apis-backend", title: "APIs & Backend", pitch: "Robust, documented APIs and services that scale.", deliverables: ["REST API design + OpenAPI docs", "Database design + optimization", "Docker + AWS deployment", "Tests"], stack: ["NestJS", "Spring Boot", "Laravel", "PostgreSQL"] },
];
```

`src/content/skills.ts`:

```ts
import type { SkillGroup } from "./types";

export const skills: SkillGroup[] = [
  { group: "AI & Agents", items: ["Claude API", "Tool use", "Structured outputs", "MCP servers", "Claude Code", "Prompt engineering", "n8n"] },
  { group: "Frontend & Mobile", items: ["React", "Next.js", "Vue.js", "React Native", "TypeScript", "Tailwind CSS"] },
  { group: "Backend", items: ["NestJS", "Node.js", "Express", "Spring Boot", "Laravel"] },
  { group: "Data", items: ["PostgreSQL", "MySQL", "MongoDB"] },
  { group: "Cloud & DevOps", items: ["AWS", "Docker", "CI/CD", "Linux", "Git"] },
  { group: "Quality & Security", items: ["Jest", "Swagger / OpenAPI", "JWT", "OAuth 2.0", "RBAC"] },
];
```

- [ ] **Step 4: Run the tests and confirm they pass.**

Run `npm test`. Expected: 4 passed.

- [ ] **Step 5: Commit.**

```bash
git add -A && git commit -m "feat: typed content modules

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Pure agent tools

**Files:**
- Create: `src/agent/tools.ts`
- Test: `tests/tools.test.ts`

**Interfaces:**
- Consumes: the content modules from Task 2.
- Produces:
  - `searchProjects(query: string): ProjectSummary[]`, where `ProjectSummary = { slug, title, tagline, stack, url }` and `url` is `/projects/<slug>`
  - `getProject(slug: string): Project | null`
  - `getExperience(): { roles: Role[]; education: Education[] }`
  - `getServices(): Service[]`
  - `getContact(): { email, whatsapp, phone, linkedin, github, cv }`

- [ ] **Step 1: Write the failing test.** `tests/tools.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it and confirm it fails.**

Run `npm test -- tests/tools.test.ts`. Expected: FAIL, module not found.

- [ ] **Step 3: Implement it.** `src/agent/tools.ts`:

```ts
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
```

- [ ] **Step 4: Run the tests and confirm they pass.**

Run `npm test`. Expected: all pass. If `"AI"` misses `sadie`, check that `sadie.tags` includes `"ai"`. It does in Task 2.

- [ ] **Step 5: Commit.**

```bash
git add -A && git commit -m "feat: pure agent tools over content

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Chat guard (shared validation)

**Files:**
- Create: `src/lib/chat-guard.ts`
- Test: `tests/chat-guard.test.ts`

**Interfaces:**
- Produces:
  - `MAX_USER_MESSAGES = 12`
  - `MAX_CHARS = 500`
  - `messageText(m: { parts?: { type: string; text?: string }[] }): string`
  - `validateChat(messages: GuardMessage[]): { ok: true } | { ok: false; status: 400 | 429; error: string }`

- [ ] **Step 1: Write the failing test.** `tests/chat-guard.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it and confirm it fails.**

Run `npm test -- tests/chat-guard.test.ts`. Expected: FAIL, module not found.

- [ ] **Step 3: Implement it.** `src/lib/chat-guard.ts`:

```ts
export const MAX_USER_MESSAGES = 12;
export const MAX_CHARS = 500;

export type GuardMessage = { role: string; parts?: { type: string; text?: string }[] };
export type GuardResult = { ok: true } | { ok: false; status: 400 | 429; error: string };

export const messageText = (m: Pick<GuardMessage, "parts">) =>
  (m.parts ?? []).filter((p) => p.type === "text").map((p) => p.text ?? "").join("");

export function validateChat(messages: GuardMessage[]): GuardResult {
  const last = messages.at(-1);
  if (!last || last.role !== "user") return { ok: false, status: 400, error: "Send a question to start." };
  const text = messageText(last).trim();
  if (!text) return { ok: false, status: 400, error: "Message is empty." };
  if (text.length > MAX_CHARS) return { ok: false, status: 400, error: `Keep it under ${MAX_CHARS} characters.` };
  const userCount = messages.filter((m) => m.role === "user").length;
  if (userCount > MAX_USER_MESSAGES) return { ok: false, status: 429, error: "Chat limit reached." };
  return { ok: true };
}
```

- [ ] **Step 4: Run the tests and confirm they pass.**

Run `npm test`. Expected: all pass.

- [ ] **Step 5: Commit.**

```bash
git add -A && git commit -m "feat: chat guard validation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Scripted fallback engine

**Files:**
- Create: `src/agent/scripted.ts`
- Test: `tests/scripted.test.ts`

**Interfaces:**
- Consumes: `searchProjects`, `getProject`, `getExperience`, `getServices` and `getContact` from Task 3.
- Produces:
  - `scriptedAnswer(question: string): ScriptedReply`, where `ScriptedReply = { tool: { name: string; args: Record<string, unknown> } | null; text: string }`. The text is markdown.
  - `SUGGESTED_PROMPTS: string[]`

- [ ] **Step 1: Write the failing test.** `tests/scripted.test.ts`:

```ts
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
});
```

- [ ] **Step 2: Run it and confirm it fails.**

Run `npm test -- tests/scripted.test.ts`. Expected: FAIL, module not found.

- [ ] **Step 3: Implement it.** `src/agent/scripted.ts`:

```ts
import { searchProjects, getProject, getExperience, getServices, getContact } from "./tools";
import { projects } from "@/content/projects";

export type ScriptedReply = { tool: { name: string; args: Record<string, unknown> } | null; text: string };

export const SUGGESTED_PROMPTS = [
  "What AI work has Chadi shipped?",
  "Can he build an MCP server for my product?",
  "How do I hire him?",
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
  if (has(q, ["hire", "service", "freelance", "price", "cost", "offer", "mvp", "build", "mcp"])) {
    const list = getServices().map((s) => `- **${s.title}**: ${s.pitch}`).join("\n");
    return { tool: { name: "get_services", args: {} }, text: `Chadi takes freelance work in:\n\n${list}\n\nTell him about your project at **chadichoker49@gmail.com**.` };
  }
  if (has(q, ["experience", "worked", "work at", "job", "company", "companies", "career", "years"])) {
    const roles = getExperience().roles.map((r) => `- **${r.title}**, ${r.company} (${r.start}–${r.end})`).join("\n");
    return { tool: { name: "get_experience", args: {} }, text: `About 2 years of production experience:\n\n${roles}` };
  }
  if (has(q, ["project", "built", "shipped", "portfolio", "ai", "llm", "agent", "work"])) {
    const query = has(q, ["ai", "llm", "agent"]) ? "ai" : "";
    const list = searchProjects(query).map((p) => `- [${p.title}](${p.url}): ${p.tagline}`).join("\n");
    return { tool: { name: "search_projects", args: { query } }, text: `Here's what Chadi has built:\n\n${list}` };
  }
  return {
    tool: null,
    text: `I'm Chadi's portfolio assistant, so I stick to his work. Try asking:\n\n${SUGGESTED_PROMPTS.map((p) => `- ${p}`).join("\n")}`,
  };
}
```

- [ ] **Step 4: Run the tests and confirm they pass.**

Run `npm test`. Expected: all pass.

Note the ordering: the MCP question must hit services (the second prompt). "What AI work has he shipped?" contains "work" but no services word, so it reaches projects. Good.

- [ ] **Step 5: Commit.**

```bash
git add -A && git commit -m "feat: scripted offline answer engine

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Chat API route

**Files:**
- Create: `src/agent/ai-tools.ts`, `src/agent/system-prompt.ts`, `src/app/api/chat/route.ts`, `.env.example`

**Interfaces:**
- Consumes: the Task 3 tools and the Task 4 `validateChat`.
- Produces: `POST /api/chat` with a `{ messages: UIMessage[] }` body.
  - Returns 503 `{ error: "offline" }` when there is no key.
  - Returns 400 or 429 `{ error }` from the guard.
  - Otherwise streams a UI message stream.
  - Tool names: `search_projects`, `get_project`, `get_experience`, `get_services`, `get_contact`.

- [ ] **Step 1: Write the AI tool wrappers.** `src/agent/ai-tools.ts`:

```ts
import { tool } from "ai";
import { z } from "zod";
import { searchProjects, getProject, getExperience, getServices, getContact } from "./tools";

export const aiTools = {
  search_projects: tool({
    description: "Search Chadi's projects by keyword (tech, domain, or name). Empty query returns all.",
    inputSchema: z.object({ query: z.string().max(100) }),
    execute: async ({ query }) => searchProjects(query),
  }),
  get_project: tool({
    description: "Full case study for one project by slug.",
    inputSchema: z.object({ slug: z.string() }),
    execute: async ({ slug }) => getProject(slug) ?? { error: "not found" },
  }),
  get_experience: tool({ description: "Chadi's work history and education.", inputSchema: z.object({}), execute: async () => getExperience() }),
  get_services: tool({ description: "Freelance services Chadi offers.", inputSchema: z.object({}), execute: async () => getServices() }),
  get_contact: tool({ description: "How to contact or hire Chadi.", inputSchema: z.object({}), execute: async () => getContact() }),
};
```

- [ ] **Step 2: Write the system prompt.** `src/agent/system-prompt.ts`:

```ts
import { profile } from "@/content/profile";

export const systemPrompt = `You are "Chadi's AI", the assistant on ${profile.name}'s portfolio. ${profile.name} is a ${profile.title} based in ${profile.location}.
Rules:
- Only discuss Chadi's work, skills, projects, services, and how to hire him. Politely steer anything else back to that.
- Always use the tools to look facts up; never invent projects, employers, numbers or dates.
- Refer to Chadi in the third person. Be concise: 2–5 sentences or a short list. Use markdown links to /projects/<slug> when mentioning a project.
- If the visitor shows hiring or project intent, end by inviting them to email ${profile.email} or use WhatsApp.
- Reply in the visitor's language.`;
```

- [ ] **Step 3: Write the route.** `src/app/api/chat/route.ts`:

```ts
import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { aiTools } from "@/agent/ai-tools";
import { systemPrompt } from "@/agent/system-prompt";
import { validateChat } from "@/lib/chat-guard";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: "offline" }, { status: 503 });

  let messages: UIMessage[];
  try {
    ({ messages } = await req.json());
    if (!Array.isArray(messages)) throw new Error();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  const guard = validateChat(messages);
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });

  const result = streamText({
    model: anthropic("claude-haiku-5-5"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: aiTools,
    stopWhen: stepCountIs(4),
    maxOutputTokens: 600,
  });
  return result.toUIMessageStreamResponse();
}
```

`.env.example`:

```
# Server-only. Set in the host's environment settings (e.g. Vercel → Settings → Environment Variables).
ANTHROPIC_API_KEY=
# Public URL of the deployed site, used for sitemap/OG/canonical.
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

- [ ] **Step 4: Verify.**

```bash
npx tsc --noEmit
npm run dev &  # wait for "Ready"
curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:3000/api/chat -H 'content-type: application/json' -d '{"messages":[]}'
```

Expected:
- `tsc` reports no errors.
- With no key, curl prints `503`.
- With a key (`ANTHROPIC_API_KEY=... npm run dev`), the same curl prints `400`.

If `tsc` flags an AI SDK API mismatch, run `grep` on `node_modules/ai/dist/index.d.ts` for the symbol and adapt. Keep the behaviour identical.

Stop the dev server.

- [ ] **Step 5: Commit.**

```bash
git add -A && git commit -m "feat: streaming agent route with tools and guards

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Agent Console UI

**Files:**
- Create: `src/components/console/ToolLine.tsx`, `src/components/console/AgentConsole.tsx`

**Interfaces:**
- Consumes: `useChat` and `DefaultChatTransport`, plus `scriptedAnswer`, `SUGGESTED_PROMPTS`, `MAX_USER_MESSAGES`, `MAX_CHARS` and `messageText`.
- Produces: `<AgentConsole />`, a client component with no props.

- [ ] **Step 1: Write `ToolLine.tsx`.**

```tsx
export function ToolLine({ name, args, done }: { name: string; args: unknown; done: boolean }) {
  const a = args && typeof args === "object" && Object.keys(args).length ? JSON.stringify(args) : "";
  return (
    <div className="font-mono text-xs text-accent/90">
      {done ? "✓" : <span className="inline-block animate-spin">⚙</span>} tool: {name}({a})
    </div>
  );
}
```

- [ ] **Step 2: Write `AgentConsole.tsx`.**

```tsx
"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ToolLine } from "./ToolLine";
import { scriptedAnswer, SUGGESTED_PROMPTS } from "@/agent/scripted";
import { MAX_USER_MESSAGES, MAX_CHARS } from "@/lib/chat-guard";

type OfflineMsg = { id: string; role: "user" | "assistant"; text: string; tool?: { name: string; args: Record<string, unknown> } | null };

export function AgentConsole() {
  const [input, setInput] = useState("");
  const [offline, setOffline] = useState(false);
  const [offlineMsgs, setOfflineMsgs] = useState<OfflineMsg[]>([]);
  const lastQuestion = useRef("");
  const scroller = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: () => {
      setOffline(true);
      answerOffline(lastQuestion.current, false);
    },
  });

  const userCount = messages.filter((m) => m.role === "user").length + offlineMsgs.filter((m) => m.role === "user").length;
  const limitReached = userCount >= MAX_USER_MESSAGES;
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, offlineMsgs]);

  function answerOffline(q: string, addUser = true) {
    const r = scriptedAnswer(q);
    setOfflineMsgs((m) => [
      ...m,
      ...(addUser ? [{ id: crypto.randomUUID(), role: "user" as const, text: q }] : []),
      { id: crypto.randomUUID(), role: "assistant" as const, text: r.text, tool: r.tool },
    ]);
  }

  function ask(q: string) {
    const text = q.trim().slice(0, MAX_CHARS);
    if (!text || busy || limitReached) return;
    lastQuestion.current = text;
    setInput("");
    if (offline) answerOffline(text);
    else sendMessage({ text });
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-panel/90 backdrop-blur shadow-[0_0_60px_-20px_#10b981]">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-mono text-[11px] text-muted">
        <span className={`size-2 rounded-full ${offline ? "bg-amber-400" : "bg-accent animate-pulse"}`} />
        chadi-ai {offline ? "· offline mode" : "· online"}
      </div>

      <div ref={scroller} className="max-h-[340px] min-h-[180px] space-y-3 overflow-y-auto px-4 py-3 text-sm" aria-live="polite">
        {messages.length === 0 && offlineMsgs.length === 0 && (
          <p className="font-mono text-muted">&gt; Ask me anything about Chadi's work.</p>
        )}
        {messages.map((m) => (
          <div key={m.id}>
            {m.parts.map((part, i) => {
              if (part.type === "text")
                return m.role === "user"
                  ? <p key={i} className="font-mono text-muted">&gt; {part.text}</p>
                  : <div key={i} className="prose-chat"><ReactMarkdown>{part.text}</ReactMarkdown></div>;
              if (part.type.startsWith("tool-")) {
                const p = part as { type: string; state: string; input?: unknown };
                return <ToolLine key={i} name={p.type.slice(5)} args={p.input} done={p.state === "output-available"} />;
              }
              return null;
            })}
          </div>
        ))}
        {offlineMsgs.map((m) => (
          <div key={m.id}>
            {m.role === "user" ? (
              <p className="font-mono text-muted">&gt; {m.text}</p>
            ) : (
              <>
                {m.tool && <ToolLine name={m.tool.name} args={m.tool.args} done />}
                <div className="prose-chat"><ReactMarkdown>{m.text}</ReactMarkdown></div>
              </>
            )}
          </div>
        ))}
        {status === "submitted" && <span className="inline-block h-4 w-2 animate-pulse bg-accent" />}
        {limitReached && (
          <p className="font-mono text-xs text-amber-400">Chat limit reached. Reach Chadi directly at chadichoker49@gmail.com.</p>
        )}
      </div>

      {messages.length === 0 && offlineMsgs.length === 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {SUGGESTED_PROMPTS.map((p) => (
            <button key={p} onClick={() => ask(p)} className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted transition hover:border-accent hover:text-accent">
              {p}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex gap-2 border-t border-border p-3">
        <label htmlFor="agent-input" className="sr-only">Ask Chadi's AI</label>
        <input
          id="agent-input" value={input} onChange={(e) => setInput(e.target.value)} maxLength={MAX_CHARS}
          disabled={limitReached} placeholder="Ask about projects, AI work, or hiring…"
          className="flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted/60"
        />
        <button type="submit" disabled={!input.trim() || busy || limitReached}
          className="rounded-md bg-accent px-3 py-1 font-mono text-xs font-semibold text-black disabled:opacity-40">
          Send ↵
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Add chat prose styles** to `globals.css`:

```css
.prose-chat { line-height: 1.6; }
.prose-chat a { color: var(--color-accent); text-decoration: underline; text-underline-offset: 3px; }
.prose-chat ul { list-style: disc; padding-left: 1.2rem; margin: .4rem 0; }
.prose-chat p + p { margin-top: .5rem; }
.prose-chat strong { color: #fff; }
```

- [ ] **Step 4: Verify.**

1. Temporarily render `<AgentConsole />` in `src/app/page.tsx`.
2. Run `npm run dev` **without** a key.
3. Open `localhost:3000` (Chrome DevTools MCP `navigate_page` + `take_screenshot`).
4. Click "What AI work has Chadi shipped?".
5. Expected:
   - The status shows "offline mode".
   - A `✓ tool: search_projects({"query":"ai"})` line appears.
   - The answer lists ArcVault.
   - No error text appears.
   - The console is clean apart from the expected 503.
6. Type spaces only. Expected: Send stays disabled.

- [ ] **Step 5: Commit.**

```bash
git add -A && git commit -m "feat: agent console with live + offline modes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Shell: background, nav, command palette, footer, layout

**Files:**
- Create: `src/components/GridBackground.tsx`, `Nav.tsx`, `CommandPalette.tsx`, `Footer.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `profile` and `projects`.
- Produces: section anchors that the later tasks must use: `#top`, `#services`, `#projects`, `#experience`, `#stack`, `#contact`.

- [ ] **Step 1: Write `GridBackground.tsx`**, a WebGL shader with a CSS fallback.

```tsx
"use client";
import { useEffect, useRef, useState } from "react";

const FRAG = `precision mediump float;
uniform vec2 r; uniform float t; uniform vec2 m;
void main(){
  vec2 uv = gl_FragCoord.xy / r;
  vec2 g = abs(fract(gl_FragCoord.xy / 28.0) - 0.5);
  float line = smoothstep(0.48, 0.5, max(g.x, g.y));
  float d = distance(uv, m);
  float glow = exp(-d * 4.0) * 0.55 + 0.08;
  float wave = 0.5 + 0.5 * sin(uv.y * 12.0 - t * 0.6 + uv.x * 3.0);
  vec3 c = vec3(0.063, 0.725, 0.506) * line * glow * (0.6 + 0.4 * wave);
  gl_FragColor = vec4(c, 1.0);
}`;
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

export function GridBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = ref.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl || reduced) { setFallback(true); return; }

    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setFallback(true); return; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, "r"), uT = gl.getUniformLocation(prog, "t"), uM = gl.getUniformLocation(prog, "m");

    let mx = 0.7, my = 0.6, raf = 0;
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    const resize = () => { canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; gl.viewport(0, 0, canvas.width, canvas.height); };
    const move = (e: PointerEvent) => { mx = e.clientX / innerWidth; my = 1 - e.clientY / innerHeight; };
    const frame = (time: number) => {
      gl.uniform2f(uR, canvas.width, canvas.height); gl.uniform1f(uT, time / 1000); gl.uniform2f(uM, mx, my);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(frame);
    };
    resize(); addEventListener("resize", resize); addEventListener("pointermove", move);
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); removeEventListener("pointermove", move); };
  }, []);

  return fallback ? (
    <div aria-hidden className="fixed inset-0 -z-10 [background-image:linear-gradient(#10b98114_1px,transparent_1px),linear-gradient(90deg,#10b98114_1px,transparent_1px)] [background-size:28px_28px]" />
  ) : (
    <canvas ref={ref} aria-hidden className="fixed inset-0 -z-10 h-full w-full" />
  );
}
```

- [ ] **Step 2: Write `CommandPalette.tsx`** (cmdk, ⌘K / Ctrl+K).

```tsx
"use client";
import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { projects } from "@/content/projects";
import { profile } from "@/content/profile";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
    };
    const onOpen = () => setOpen(true);
    addEventListener("keydown", onKey); addEventListener("open-palette", onOpen);
    return () => { removeEventListener("keydown", onKey); removeEventListener("open-palette", onOpen); };
  }, []);

  const go = (href: string) => { setOpen(false); href.startsWith("http") || href.endsWith(".pdf") ? window.open(href, "_blank") : router.push(href); };
  const item = "flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm aria-selected:bg-accent/15 aria-selected:text-accent";

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Command menu"
      className="fixed left-1/2 top-[20vh] z-50 w-[min(560px,92vw)] -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-panel font-mono shadow-2xl"
      overlayClassName="fixed inset-0 z-40 bg-black/60">
      <Command.Input placeholder="Type a command…" className="w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none" />
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="px-3 py-2 text-sm text-muted">command not found</Command.Empty>
        <Command.Group heading="Navigate" className="text-[11px] text-muted">
          {["services", "projects", "experience", "stack", "contact"].map((s) => (
            <Command.Item key={s} className={item} onSelect={() => go(`/#${s}`)}>/{s}</Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Projects" className="text-[11px] text-muted">
          {projects.map((p) => <Command.Item key={p.slug} className={item} onSelect={() => go(`/projects/${p.slug}`)}>{p.title}</Command.Item>)}
        </Command.Group>
        <Command.Group heading="Contact" className="text-[11px] text-muted">
          <Command.Item className={item} onSelect={() => { navigator.clipboard.writeText(profile.email); setOpen(false); }}>Copy email</Command.Item>
          <Command.Item className={item} onSelect={() => go(profile.whatsapp)}>WhatsApp</Command.Item>
          <Command.Item className={item} onSelect={() => go(profile.github)}>GitHub</Command.Item>
          <Command.Item className={item} onSelect={() => go(profile.linkedin)}>LinkedIn</Command.Item>
          <Command.Item className={item} onSelect={() => go(profile.cv)}>Download CV</Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
```

- [ ] **Step 3: Write `Nav.tsx` and `Footer.tsx`.**

```tsx
// Nav.tsx
"use client";
import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-bg/70 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 font-mono text-sm">
        <Link href="/#top" className="font-semibold text-fg"><span className="text-accent">~/</span>chadi</Link>
        <div className="hidden gap-6 text-muted sm:flex">
          {["services", "projects", "experience", "contact"].map((s) => (
            <Link key={s} href={`/#${s}`} className="hover:text-accent">/{s}</Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => dispatchEvent(new Event("open-palette"))} className="hidden rounded border border-border px-2 py-1 text-[11px] text-muted hover:text-accent sm:block" aria-label="Open command menu">⌘K</button>
          <Link href="/#contact" className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-black">Hire me</Link>
        </div>
      </nav>
    </header>
  );
}
```

```tsx
// Footer.tsx
import { profile } from "@/content/profile";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center font-mono text-xs text-muted">
      © {new Date().getFullYear()} {profile.name} · built with Next.js + Claude ·{" "}
      <a href={profile.github} className="hover:text-accent">GitHub</a>
    </footer>
  );
}
```

- [ ] **Step 4: Write `layout.tsx`**, including the JSON-LD `Person` schema.

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GridBackground } from "@/components/GridBackground";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CommandPalette } from "@/components/CommandPalette";
import { profile } from "@/content/profile";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${profile.name} · ${profile.title}`, template: `%s · ${profile.name}` },
  description: profile.summary,
  openGraph: { type: "website", siteName: profile.name },
  twitter: { card: "summary_large_image" },
};

const jsonLd = {
  "@context": "https://schema.org", "@type": "Person", name: profile.name, jobTitle: profile.title,
  email: `mailto:${profile.email}`, url: SITE_URL, sameAs: [profile.github, profile.linkedin],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <GridBackground />
        <Nav />
        <main id="top">{children}</main>
        <Footer />
        <CommandPalette />
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify.**

Run `npm run build`. Expected: passes.

With `npm run dev` and Chrome DevTools MCP:
- The grid shows behind the content.
- ⌘K opens the palette.
- Typing "zzz" shows "command not found".
- `emulate` with reduced motion shows the static CSS grid.

- [ ] **Step 6: Commit.**

```bash
git add -A && git commit -m "feat: WebGL grid, nav, command palette, footer, layout

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Home page sections

**Files:**
- Create: `src/components/sections/Hero.tsx`, `Services.tsx`, `Projects.tsx`, `Experience.tsx`, `Stack.tsx`, `Contact.tsx`, `src/components/Reveal.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: the content modules, `<AgentConsole />`, and the anchors from Task 8.

- [ ] **Step 1: Write `Reveal.tsx`**, an entrance animation that respects reduced motion.

```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Write the section components.**

```tsx
// Hero.tsx
import { AgentConsole } from "@/components/console/AgentConsole";
import { profile } from "@/content/profile";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-16 md:grid-cols-[1fr_1.1fr] md:pt-24">
      <div>
        <p className="font-mono text-xs tracking-[0.2em] text-accent">● {profile.availability.toUpperCase()}</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight md:text-6xl">{profile.name}</h1>
        <p className="mt-2 text-xl text-muted">{profile.title}</p>
        <p className="mt-6 max-w-md leading-relaxed text-fg/80">{profile.summary}</p>
        <div className="mt-8 flex flex-wrap gap-3 font-mono text-sm">
          <a href="#contact" className="rounded-md bg-accent px-4 py-2 font-semibold text-black">Start a project →</a>
          <a href="#projects" className="rounded-md border border-border px-4 py-2 hover:border-accent hover:text-accent">See work</a>
        </div>
      </div>
      <AgentConsole />
    </section>
  );
}
```

```tsx
// Services.tsx
import { services } from "@/content/services";
import { Reveal } from "@/components/Reveal";

export function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
      <h2 className="font-mono text-sm text-accent">/services</h2>
      <p className="mt-2 text-3xl font-bold">What I can build for you</p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {services.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.05}>
            <article className={`group h-full rounded-xl border border-border bg-panel/80 p-6 transition hover:-translate-y-0.5 hover:border-accent/50 ${i === 0 ? "md:row-span-2" : ""}`}>
              <h3 className="text-xl font-semibold group-hover:text-accent">{s.title}</h3>
              <p className="mt-2 text-fg/75">{s.pitch}</p>
              <ul className="mt-4 space-y-1 font-mono text-xs text-muted">{s.deliverables.map((d) => <li key={d}>▸ {d}</li>)}</ul>
              <p className="mt-4 font-mono text-[11px] text-accent/80">{s.stack.join(" · ")}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// Projects.tsx
import Link from "next/link";
import { projects } from "@/content/projects";
import { Reveal } from "@/components/Reveal";

export function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
      <h2 className="font-mono text-sm text-accent">/projects</h2>
      <p className="mt-2 text-3xl font-bold">Selected work</p>
      <div className="mt-10 grid gap-4 md:grid-cols-6">
        {projects.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.05}>
            <Link href={`/projects/${p.slug}`} className={`group block h-full rounded-xl border border-border bg-panel/80 p-6 transition hover:border-accent/50 ${i < 2 ? "md:col-span-3" : "md:col-span-2"}`}>
              <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase text-muted">{p.tags.map((t) => <span key={t}>#{t}</span>)}</div>
              <h3 className="mt-3 text-lg font-semibold group-hover:text-accent">{p.title}</h3>
              <p className="mt-1 text-sm text-fg/70">{p.tagline}</p>
              <p className="mt-4 font-mono text-[11px] text-accent/80">{p.stack.slice(0, 4).join(" · ")}</p>
              <span className="mt-4 inline-block font-mono text-xs text-muted group-hover:text-accent">read case study →</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
```

`Reveal` wraps each card in a `div`, so for the grid spans to apply, pass the span class to that wrapper. Change `Reveal` to accept `className?: string` and put it on `motion.div` (or on the fragment fallback's wrapping `div`). Then move the `md:col-span-*` and `md:row-span-2` classes from the inner element to `<Reveal className=…>`. Make this change in Step 1's `Reveal`:

```tsx
export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
}
```

```tsx
// Experience.tsx
import { experience, education } from "@/content/experience";
import { Reveal } from "@/components/Reveal";

export function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-20">
      <h2 className="font-mono text-sm text-accent">/experience</h2>
      <p className="mt-2 text-3xl font-bold">Where I've shipped</p>
      <ol className="mt-10 space-y-8 border-l border-border pl-6">
        {experience.map((r) => (
          <Reveal key={r.company}>
            <li className="relative">
              <span className="absolute -left-[29px] top-1.5 size-2.5 rounded-full bg-accent shadow-[0_0_12px_#10b981]" />
              <p className="font-mono text-xs text-muted">{r.start} — {r.end} · {r.location}</p>
              <h3 className="mt-1 text-lg font-semibold">{r.title} <span className="text-accent">@ {r.company}</span></h3>
              <ul className="mt-2 space-y-1 text-sm text-fg/75">{r.bullets.map((b) => <li key={b}>▸ {b}</li>)}</ul>
            </li>
          </Reveal>
        ))}
        {education.map((e) => (
          <li key={e.school} className="relative">
            <span className="absolute -left-[29px] top-1.5 size-2.5 rounded-full border border-accent bg-bg" />
            <p className="font-mono text-xs text-muted">{e.start} — {e.end}</p>
            <h3 className="mt-1 font-semibold">{e.degree} <span className="text-muted">· {e.school}</span></h3>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

```tsx
// Stack.tsx
import { skills } from "@/content/skills";

export function Stack() {
  return (
    <section id="stack" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
      <h2 className="font-mono text-sm text-accent">/stack</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((g) => (
          <div key={g.group} className="rounded-xl border border-border bg-panel/80 p-5">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted">{g.group}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {g.items.map((s) => <span key={s} className="rounded-md border border-border px-2 py-1 text-xs text-fg/85">{s}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// Contact.tsx
import { profile } from "@/content/profile";

const links = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "WhatsApp", value: profile.phone, href: profile.whatsapp },
  { label: "LinkedIn", value: "chadi-choker", href: profile.linkedin },
  { label: "GitHub", value: "ChadiChoker", href: profile.github },
];

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-24 text-center">
      <h2 className="font-mono text-sm text-accent">/hire</h2>
      <p className="mt-2 text-4xl font-bold">Have a project in mind?</p>
      <p className="mx-auto mt-4 max-w-lg text-fg/75">Tell me what you're building. I usually reply within 24 hours.</p>
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
            className="rounded-xl border border-border bg-panel/80 p-5 text-left transition hover:border-accent">
            <p className="font-mono text-xs text-muted">{l.label}</p>
            <p className="mt-1 font-semibold">{l.value}</p>
          </a>
        ))}
      </div>
      <a href={profile.cv} download className="mt-8 inline-block font-mono text-sm text-accent underline underline-offset-4">Download CV (PDF)</a>
    </section>
  );
}
```

- [ ] **Step 3: Write `page.tsx`.**

```tsx
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Projects } from "@/components/sections/Projects";
import { Experience } from "@/components/sections/Experience";
import { Stack } from "@/components/sections/Stack";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (<><Hero /><Services /><Projects /><Experience /><Stack /><Contact /></>);
}
```

- [ ] **Step 4: Verify.**

Run `npm run build`. Expected: passes.

With Chrome DevTools MCP, take screenshots at 1440×900 and at 390×844 (`emulate`).
- No horizontal scroll at 390px: `evaluate_script` for `document.documentElement.scrollWidth <= innerWidth` returns `true`.
- Contact is reachable in one click via "Hire me".

- [ ] **Step 5: Commit.**

```bash
git add -A && git commit -m "feat: home sections (services, projects, experience, stack, contact)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Case studies, 404, SEO

**Files:**
- Create: `src/app/projects/[slug]/page.tsx`, `src/app/not-found.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`

- [ ] **Step 1: Write the case study page.**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { projects } from "@/content/projects";
import { getProject } from "@/agent/tools";

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p ? { title: p.title, description: p.tagline } : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProject((await params).slug);
  if (!p) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/#projects" className="font-mono text-xs text-muted hover:text-accent">← cd ../projects</Link>
      <h1 className="mt-6 text-4xl font-bold">{p.title}</h1>
      <p className="mt-2 text-lg text-muted">{p.tagline}</p>
      <div className="mt-6 flex flex-wrap gap-3 font-mono text-sm">
        <a href={p.repoUrl} target="_blank" rel="noreferrer" className="rounded-md border border-border px-3 py-1.5 hover:border-accent hover:text-accent">GitHub →</a>
        {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="rounded-md bg-accent px-3 py-1.5 font-semibold text-black">Live demo →</a>}
      </div>
      {([["Problem", p.problem], ["Solution", p.solution]] as const).map(([h, t]) => (
        <section key={h} className="mt-10"><h2 className="font-mono text-sm text-accent">## {h}</h2><p className="mt-2 leading-relaxed text-fg/80">{t}</p></section>
      ))}
      {([["Architecture", p.architecture], ["Highlights", p.highlights]] as const).map(([h, list]) => (
        <section key={h} className="mt-10"><h2 className="font-mono text-sm text-accent">## {h}</h2>
          <ul className="mt-2 space-y-1 text-fg/80">{list.map((x) => <li key={x}>▸ {x}</li>)}</ul></section>
      ))}
      <section className="mt-10"><h2 className="font-mono text-sm text-accent">## Stack</h2>
        <div className="mt-3 flex flex-wrap gap-2">{p.stack.map((s) => <span key={s} className="rounded-md border border-border px-2 py-1 text-xs">{s}</span>)}</div></section>
      <div className="mt-16 rounded-xl border border-accent/30 bg-panel p-6 text-center">
        <p className="font-semibold">Want something like this built?</p>
        <Link href="/#contact" className="mt-3 inline-block rounded-md bg-accent px-4 py-2 font-mono text-sm font-semibold text-black">Hire me →</Link>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Write `not-found.tsx`.**

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-32 font-mono">
      <p className="text-muted">$ cd {"<this page>"}</p>
      <p className="mt-2 text-amber-400">zsh: command not found (404)</p>
      <Link href="/" className="mt-6 inline-block text-accent underline underline-offset-4">cd ~ →</Link>
    </div>
  );
}
```

- [ ] **Step 3: Write the sitemap, robots and OG image.**

```ts
// sitemap.ts
import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: base, priority: 1 }, ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, priority: 0.7 }))];
}
```

```ts
// robots.ts
import type { MetadataRoute } from "next";
const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }], sitemap: `${base}/sitemap.xml` };
}
```

```tsx
// opengraph-image.tsx
import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${profile.name}, ${profile.title}`;
export default function OG() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#07090c", color: "#e6edf3", backgroundImage: "linear-gradient(#10b98122 1px, transparent 1px), linear-gradient(90deg, #10b98122 1px, transparent 1px)", backgroundSize: "40px 40px" }}>
      <div style={{ color: "#10b981", fontSize: 28, fontFamily: "monospace" }}>● agent online</div>
      <div style={{ fontSize: 88, fontWeight: 800, marginTop: 20 }}>{profile.name}</div>
      <div style={{ fontSize: 40, color: "#8b949e", marginTop: 8 }}>{profile.title}</div>
    </div>,
    size,
  );
}
```

- [ ] **Step 4: Verify.**

Run `npm run build`. Expected: 5 static `/projects/*` routes, plus `/sitemap.xml`, `/robots.txt` and `/opengraph-image`.

Run `npm start`, then:
- `curl -s -o /dev/null -w "%{http_code}" localhost:3000/projects/nope` prints `404`, and the page shows "command not found".
- `curl -s localhost:3000/sitemap.xml | grep -c "<url>"` prints `6`.

- [ ] **Step 5: Commit.**

```bash
git add -A && git commit -m "feat: case study pages, terminal 404, sitemap, robots, OG image

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: QA pass and portfolio README

**Files:**
- Create: `README.md` (replacing the create-next-app one), `docs/screenshot.png`

- [ ] **Step 1: Run the full checks.**

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

Expected: all pass.

- [ ] **Step 2: Run the Chrome DevTools MCP checks against `npm start`.**

- `list_console_messages`: no errors other than the expected 503 from `/api/chat` with no key.
- `lighthouse_audit` (desktop and mobile): Performance, Accessibility, Best Practices and SEO each at 95 or higher. If one falls short, fix the specific audit item (contrast, labels, image sizes, CLS) and rerun.
- `take_screenshot` at 1440×900 of the hero, saved to `docs/screenshot.png`.

- [ ] **Step 3: Write `README.md`.**

````markdown
# chadi.dev: Agent Console Portfolio

![screenshot](docs/screenshot.png)

Portfolio of **Chadi Choker**, Software & AI Product Engineer. The hero is a live Claude agent ("Chadi's AI") that answers questions about my work using tool calls you can watch happen. If no API key is set, it falls back to a scripted offline mode.

## Stack
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Vercel AI SDK v7 · Claude Haiku 5.5 · WebGL · cmdk · Vitest

## Architecture
- `src/content/*`: single source of truth (projects, experience, services, skills)
- `src/agent/tools.ts`: pure query functions over content, used by the AI tools, the offline engine and the pages
- `src/app/api/chat/route.ts`: streaming agent with 5 read-only tools, `stopWhen: stepCountIs(4)`, `maxOutputTokens: 600`
- `src/lib/chat-guard.ts`: 12 messages / 500 chars per conversation, enforced on client and server
- `src/agent/scripted.ts`: offline keyword engine used when the API is unavailable

## Run locally
```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY (optional)
npm run dev
npm test
```

## Deploy (Vercel)
1. Import this repo in Vercel.
2. Set env vars: `ANTHROPIC_API_KEY` (server-only), `NEXT_PUBLIC_SITE_URL` (your domain).
3. In the Anthropic Console, set a **monthly spend limit** on the key.

Netlify and Cloudflare also work (standard Next.js route handlers, no Vercel-only APIs).
````

- [ ] **Step 4: Commit.**

```bash
git add -A && git commit -m "docs: README with architecture and deploy guide

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Publish and GitHub makeover

**Prerequisite (Chadi):** create two **empty** public repos at github.com/new while signed in as ChadiChoker: `portfolio` and `ChadiChoker` (the profile README repo). Do not add a README, license or .gitignore. The SSH key works for pushing but cannot create repos.

**Files:**
- Create, in a scratch clone: `ChadiChoker/README.md` and README rewrites for 7 repos

- [ ] **Step 1: Push the portfolio.**

```bash
cd ~/Projects/portfolio
git remote add origin git@github-personal:ChadiChoker/portfolio.git
git branch -M main && git push -u origin main
```

Expected: the push succeeds, and the commits on GitHub show author "Chadi Choker".

- [ ] **Step 2: Write and push the profile README.**

Work in the scratchpad directory, `<scratch>/gh/ChadiChoker`. Run `git init`, then set the same repo-local `user.name`/`user.email` as the portfolio.

`README.md`:

```markdown
### Hi, I'm Chadi 👋
**Software & AI Product Engineer** · Lebanon · Remote

I build production web & mobile apps and wire AI into them: LLM features, **MCP servers** that connect agents to real systems, and agentic workflows with Claude Code.

🟢 **Open to freelance:** AI integration · MCP & automation · full-stack MVPs · APIs
📫 chadichoker49@gmail.com · [LinkedIn](https://www.linkedin.com/in/chadi-choker-592371295) · [Portfolio](https://github.com/ChadiChoker/portfolio)

**Stack:** TypeScript · React · Next.js · React Native · NestJS · Node · Spring Boot · Laravel · PostgreSQL · MySQL · MongoDB · Docker · AWS · Claude API · MCP

#### Featured
| Project | What | Stack |
|---|---|---|
| [portfolio](https://github.com/ChadiChoker/portfolio) | Portfolio with a live Claude agent + tool calls | Next.js, AI SDK, WebGL |
| [arcvault-pipeline](https://github.com/ChadiChoker/arcvault-pipeline) | LLM intake & triage pipeline | n8n, Llama 3.3 70B |
| [vehicle-ai-backend](https://github.com/ChadiChoker/vehicle-ai-backend) | AI vehicle damage detection API | Node, Docker, CI |
| [sadie-webhook-backend](https://github.com/ChadiChoker/sadie-webhook-backend) | AI call-event ingestion + dashboard | Spring Boot, Postgres, React |
| [liu-meet](https://github.com/ChadiChoker/liu-meet) | Group video calls | Laravel, React, WebRTC |
```

Commit it, add the remote `git@github-personal:ChadiChoker/ChadiChoker.git`, then `git push -u origin main`.

- [ ] **Step 3: Rewrite the READMEs of the 7 repos.**

For each of `arcvault-pipeline`, `vehicle-ai-backend`, `vehicle-ai-frontend`, `sadie-dashboard`, `sadie-webhook-backend`, `liu-meet` and `hassanzeaiter`:

1. `git clone git@github-personal:ChadiChoker/<repo>.git <scratch>/gh/<repo>`, then set the repo-local identity.
2. Read the existing README and the code layout (`ls`, `package.json`/`pom.xml`/`composer.json`).
3. Write the new README with this structure:
   1. Title and one-line tagline (from `projects.ts`)
   2. Problem → Solution (2–3 sentences)
   3. Features (bullets)
   4. Stack
   5. Architecture (bullets)
   6. Getting started: **keep the existing accurate setup/env/run instructions**
   7. API docs link, if present
   8. Related repo link, if any (frontend ↔ backend)
   9. A "Built by Chadi Choker" footer with a portfolio link
4. Facts come only from the code and the old README. Don't invent features.
5. Commit with `docs: rewrite README` plus the trailer, then `git push`.

- [ ] **Step 4: Set repo metadata.**

This needs an authenticated `gh` for ChadiChoker. If none is available, list each description and topic set for Chadi to paste in each repo's ⚙ "About" panel. Descriptions are the taglines from `projects.ts`.

Topics:

| Repo | Topics |
|---|---|
| portfolio | `nextjs`, `ai-agent`, `claude`, `portfolio`, `webgl` |
| arcvault-pipeline | `llm`, `n8n`, `automation`, `groq` |
| vehicle-ai-backend | `nodejs`, `computer-vision`, `docker`, `rest-api` |
| vehicle-ai-frontend | `react`, `typescript`, `vite` |
| sadie-webhook-backend | `spring-boot`, `postgresql`, `webhooks` |
| sadie-dashboard | `react`, `typescript`, `dashboard` |
| liu-meet | `webrtc`, `laravel`, `react`, `websockets` |
| hassanzeaiter | `laravel`, `rest-api`, `docker` |

- [ ] **Step 5: Tell Chadi what to pin.**

Pin these repos on the profile page (Customize your pins): portfolio, arcvault-pipeline, vehicle-ai-backend, sadie-webhook-backend, liu-meet, hassanzeaiter.

---

## Self-review notes

- **Spec coverage:**

  | Spec section | Task(s) |
  |---|---|
  | §2 stack | 1, 8 |
  | §3 content | 2 |
  | §4 pages | 8–10 |
  | §5 agent | 3–7 |
  | §6 GitHub | 12 |
  | §7 errors | 4, 5, 7, 8, 10 |
  | §8 testing | every task, plus 11 |

  shadcn/Magic UI MCPs are optional during execution. The plan's components are hand-written, so it has no hard dependency on them. Use them in Task 9 to polish sections where they help.

- **Review Focus coverage:**

  | Item | Covered by |
  |---|---|
  | 1. Empty message | Task 4 test, Task 7 disabled button |
  | 2. 13th message | Task 4 test, Task 7 limit line |
  | 3. Missing key or API failure | Task 6 curl 503, Task 7 offline verification |
  | 4. Off-topic question | Task 5 test |
  | 5. Unknown slug | Task 10 curl 404 |
