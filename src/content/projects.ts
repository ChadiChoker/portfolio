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
