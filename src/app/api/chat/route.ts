import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { model, MODEL_OPTIONS } from "@/agent/model";
import { aiTools } from "@/agent/ai-tools";
import { systemPrompt } from "@/agent/system-prompt";
import { validateChat, sanitizeHistory } from "@/lib/chat-guard";
import { createRateLimiter } from "@/lib/rate-limit";

export const maxDuration = 30;

// 20 questions per visitor per 10 minutes, 300 per instance per 10 minutes overall.
const limiter = createRateLimiter({ perKey: 20, globalLimit: 300, windowMs: 10 * 60_000 });
const visitor = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "anonymous";

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: "offline" }, { status: 503 });

  const rate = limiter.check(visitor(req));
  if (!rate.ok) return Response.json({ error: "Too many questions, try again shortly." }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } });

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
    model,
    system: systemPrompt,
    messages: await convertToModelMessages(sanitizeHistory(messages)),
    tools: aiTools,
    ...MODEL_OPTIONS,
  });
  return result.toUIMessageStreamResponse();
}
