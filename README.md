# Agent Console Portfolio

![Portfolio hero with the live agent console](docs/screenshot.png)

Portfolio of **Chadi Choker**, Software & AI Product Engineer.

The hero is a live Claude agent, **"Chadi's AI"**, that answers visitors' questions about my work. It calls tools over my real project, experience and service data, and visitors watch those tool calls happen. If no API key is configured, it falls back to a scripted offline mode, so the console never breaks.

**Lighthouse:** 98–100 on mobile, 100 on desktop across Performance, Accessibility, Best Practices and SEO.

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS v4 · Vercel AI SDK v7 · Claude Haiku 5.5 · WebGL · cmdk · Vitest

## Architecture

| Path | Role |
|---|---|
| `src/content/*` | Single source of truth: projects, experience, services, skills |
| `src/agent/tools.ts` | Pure query functions over content. Used by the AI tools, the offline engine and the pages. |
| `src/app/api/chat/route.ts` | Streaming agent: 5 read-only tools, `stopWhen: stepCountIs(4)`, `maxOutputTokens: 600` |
| `src/lib/chat-guard.ts` | 12 messages and 500 characters per conversation, enforced on client and server |
| `src/agent/scripted.ts` | Offline keyword engine, used when the API is unavailable |
| `src/components/console/*` | `ConsoleLoader` renders a lightweight shell, and the live `AgentConsole` (AI SDK, markdown) loads on first interaction |
| `src/components/GridBackground.tsx` | Fragment-shader grid that follows the cursor. Falls back to CSS under reduced motion or when WebGL is unavailable. |

## Run locally

```bash
npm install
cp .env.example .env.local   # ANTHROPIC_API_KEY is optional; without it the console runs offline
npm run dev
npm test
```

## Deploy (Vercel)

1. Import this repo in Vercel.
2. Set the environment variables:
   - `ANTHROPIC_API_KEY`: server-only
   - `NEXT_PUBLIC_SITE_URL`: your domain, used for the sitemap, OG images and canonical URLs
3. In the Anthropic Console, set a **monthly spend limit** on the key.

Netlify and Cloudflare also work. The site uses standard Next.js route handlers and no Vercel-only APIs.
