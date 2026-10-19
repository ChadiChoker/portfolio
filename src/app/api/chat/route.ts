import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { aiTools } from "@/agent/ai-tools";
import { systemPrompt } from "@/agent/system-prompt";
import { validateChat, sanitizeHistory } from "@/lib/chat-guard";

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
    messages: await convertToModelMessages(sanitizeHistory(messages)),
    tools: aiTools,
    stopWhen: stepCountIs(4),
    maxOutputTokens: 600,
  });
  return result.toUIMessageStreamResponse();
}
