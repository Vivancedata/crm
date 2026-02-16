import { anthropic } from "@ai-sdk/anthropic";

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("[ai] ANTHROPIC_API_KEY not set — AI features will be unavailable");
}

export const aiModel = process.env.ANTHROPIC_API_KEY ? anthropic("claude-sonnet-4-5-20250929") : null;
