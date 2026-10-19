# Chadi Choker Portfolio: Design Spec

**Date:** 2026-10-19
**Owner:** Chadi Choker (personal GitHub: `ChadiChoker`)
**Status:** Approved in brainstorming, pending spec review

## 1. Intent

| | |
|---|---|
| **Primary goal** | Win freelance clients |
| **Secondary goal** | Impress companies that are hiring |
| **Positioning** | *Software & AI Product Engineer: I build production web apps and wire AI into them.* |
| **Signature feature** | A live "Ask my AI" agent in the hero. It answers questions about Chadi's work using visible tool calls, so it works as both a portfolio item and a proof of skill. |
| **Visual direction** | **A, Agent Console:** dark, dev-terminal look with an emerald accent (`#10b981`), a subtle animated grid and a ⌘K palette |
| **Success criteria** | Lighthouse 95 or higher in every category, desktop and mobile. A visitor can reach contact in at most 2 clicks from any page. The agent answers grounded questions correctly and never shows a broken state. |

**Constraints**
- **Hosting:** a third party will host the site. Target **Vercel**, deployed from GitHub. Netlify or Cloudflare must also work, and the build must not depend on anything Vercel-only beyond standard Next.js route handlers.
- **No domain yet:** the site URL comes from an env var (`NEXT_PUBLIC_SITE_URL`) and nothing hardcodes a domain.
- **Separation from work:** no work account, work email or work code appears anywhere. Aspire is described only at the level of the CV.

## 2. Stack

- **Framework:** Next.js (App Router, latest stable), TypeScript strict mode, Tailwind CSS v4.
- **Components:** shadcn/ui as the base, with Magic UI for animated pieces such as shimmer, marquee and number ticker. Both are pulled in through their MCPs. 21st.dev Magic MCP is used to explore section designs.
- **Motion:** `motion`.
- **Background:** a WebGL animated grid built with a raw `<canvas>` and a small fragment shader. No Three.js, to keep the bundle small. It is disabled under `prefers-reduced-motion` and falls back to a static CSS grid.
- **Agent:** Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`) using model `claude-haiku-5-5`.
- **Tests:** Vitest for content and tools.
- **Visual and performance QA:** Chrome DevTools MCP.

## 3. Content model (single source of truth)

`src/content/` holds typed TypeScript modules. The pages, the agent tools and the system prompt all read from them.

- `profile.ts`: name, title, location, email (`chadichoker49@gmail.com`), WhatsApp (`+961 81 410 706`), LinkedIn, GitHub, languages, summary
- `experience.ts`: Aspire Software (04/2026–present), Javelynx (01–04/2026), PROradius (01/2025–present), JumpCloud (09/2024–02/2025), LIU BSc CS (2021–2024). Bullets come from the CV.
- `projects.ts`: `slug`, `title`, `tagline`, `problem`, `solution`, `architecture` (bullets), `stack[]`, `highlights[]`, `repoUrl`, `liveUrl?`, `tags[]`, `featured`
  - `arcvault`: AI intake and triage pipeline (n8n, Groq Llama 3.3 70B)
  - `vehicle-ai`: AI vehicle damage detection (Node, React/TS, Docker, CI). Live: vehicle-ai-frontend.vercel.app
  - `sadie`: AI call-activity dashboard and webhook receiver (React/TS, Spring Boot, Postgres, Flyway)
  - `liu-meet`: group video calls (Laravel, React, WebRTC, WebSockets)
  - `classifieds-api`: OLX-style API with dynamic category fields (Laravel, Docker)
- `services.ts`: AI Integration, MCP Servers & AI Automation, Full-Stack MVPs (web and mobile), APIs & Backend. Each has a title, a pitch, deliverables and its stack.
- `skills.ts`: grouped exactly as on the CV

## 4. Pages and sections

**`/` (single scroll)**
1. **Hero / Agent Console:** name, title and availability badge; the chat console with 3 suggested prompts; quick commands (`/projects`, `/services`, `/hire`)
2. **Services:** bento grid of 4 services
3. **Featured projects:** cards linking to case studies
4. **Experience:** vertical timeline
5. **Stack:** grouped skills on a marquee
6. **Contact:** email, WhatsApp, LinkedIn, GitHub and a CV download (`/Chadi_Choker_CV.pdf`)

**`/projects/[slug]`:** case study pages, statically generated from `projects.ts`

**Global**
- Sticky minimal nav with a "Hire me" call to action
- ⌘K command palette that jumps to sections, projects and contact links, and can copy the email
- Footer

**SEO**
- Metadata per page
- `sitemap.ts` and `robots.ts`
- Dynamic Open Graph images (`opengraph-image.tsx`)
- JSON-LD `Person` schema

## 5. Agent

**Route:** `POST /api/chat` (Node runtime), using `streamText` with tools and multi-step tool calling (`stopWhen: stepCountIs(4)`).

**Tools** (read-only, pure functions over `content/`, unit-tested):

| Tool | Returns |
|---|---|
| `search_projects({ query })` | Matching project summaries, by keyword over title, tags and stack |
| `get_project({ slug })` | Full project details |
| `get_experience()` | The experience timeline |
| `get_services()` | The service list |
| `get_contact()` | Contact channels |

**System prompt**
- Answer only about Chadi's work, using the tools.
- Speak about Chadi in the third person, as "Chadi's AI".
- Be concise.
- Steer off-topic questions back to his work.
- Never invent facts.
- When a visitor shows hiring or project intent, point them to contact.

**UI**
- Tool calls render as `⚙ tool: name(args)` lines in emerald.
- Answers stream with a blinking cursor.
- Markdown is rendered.

**Guards**
- At most 12 user messages per conversation, enforced on both client and server, and at most 500 characters per message.
- `maxOutputTokens: 600`.
- The server checks the message count and length, and returns 429 or 400.
- A monthly spend cap is set by Chadi in the Anthropic console. It's documented in the README.

**Fallback**
- If `ANTHROPIC_API_KEY` is missing or the API errors, the client switches to **scripted mode**.
- Scripted mode matches keywords against canned answers built from the same `content/`, and still shows the matching tool-call line, so the UI stays consistent.
- A small "offline mode" label shows that it's in this mode.

## 6. GitHub makeover (`ChadiChoker`)

1. **New public repo `ChadiChoker/portfolio`** for this project, with a full README: screenshot, stack, architecture, how to run, env vars and deployment.
2. **New public repo `ChadiChoker/ChadiChoker`** holding the profile README: headline, what he builds, stack badges, featured projects, contact and a link to the portfolio.
3. **Rewritten READMEs**, pushed as commits to each repo:
   - `arcvault-pipeline`
   - `vehicle-ai-backend` and `vehicle-ai-frontend` (replacing the Vite template)
   - `sadie-dashboard` and `sadie-webhook-backend`
   - `liu-meet`
   - `hassanzeaiter` (Classifieds API)
4. **Repo metadata:** description, topics and homepage set on each repo with `gh repo edit`.
5. **Pinning:** the GitHub API doesn't support it, so Chadi pins repos by hand. Pin list: portfolio, arcvault-pipeline, vehicle-ai-backend, sadie-webhook-backend, liu-meet, hassanzeaiter.

**Git identity:** repo-local `user.name "Chadi Choker"` and `user.email 135199733+ChadiChoker@users.noreply.github.com`. Push using `gh auth switch --user ChadiChoker`, then switch back to `chadichokerAspire`.

## 7. Errors and edge cases

- Agent API errors are handled by the scripted fallback, so no raw errors reach the UI.
- If WebGL isn't supported, or the visitor prefers reduced motion, a static CSS grid is shown.
- The client never sees the key. It lives only in server env.
- If a visitor gets an unknown project slug, they get a 404 page styled as a terminal (`command not found`).

## 8. Testing and verification

- **Vitest:** content schema sanity (unique slugs, required fields), each tool's output, scripted-mode matching, and the route's guard validation.
- **Build:** `next build` passes with no type or lint errors.
- **Chrome DevTools MCP:** screenshots at 1440px and 390px, an empty console, a Lighthouse run at 95 or higher, and a check that the agent flow works in both live mode (if a key is available) and scripted mode.

## 9. Out of scope (YAGNI)

- CMS or blog
- Analytics (the host can add Vercel Analytics later)
- Contact form backend (email and WhatsApp links are enough)
- i18n
- Light theme (the site is dark-only, by design)
- Distributed rate limiting with Redis or KV
