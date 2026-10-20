import { describe, it, expect } from "vitest";
import { MODEL_OPTIONS } from "@/agent/model";

describe("chat model options", () => {
  it("disables thinking so the whole output budget goes to the answer", () => {
    expect(MODEL_OPTIONS.providerOptions.anthropic.thinking).toEqual({ type: "disabled" });
    expect(MODEL_OPTIONS.providerOptions.anthropic.effort).toBe("low");
    expect(MODEL_OPTIONS.maxOutputTokens).toBeGreaterThanOrEqual(600);
  });
});
