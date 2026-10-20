import { anthropic } from "@ai-sdk/anthropic";
import { stepCountIs } from "ai";

export const model = anthropic("claude-haiku-5-5");

// Haiku 5.5 thinks adaptively by default, and thinking counts against max tokens: with a small cap a
// tool-using turn could end with no visible answer. Short factual answers don't need it.
export const MODEL_OPTIONS = {
  maxOutputTokens: 700,
  stopWhen: stepCountIs(3),
  providerOptions: { anthropic: { thinking: { type: "disabled" as const }, effort: "low" as const } },
};
