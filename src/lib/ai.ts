import { anthropic } from "@ai-sdk/anthropic";

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("[ai] ANTHROPIC_API_KEY not set — AI features will be unavailable");
}

// Bare model IDs only -- never append a date suffix. The previous value,
// "claude-sonnet-4-5-20250929", pinned a superseded model. Sonnet 5 rejects
// budget_tokens, non-default temperature/top_p/top_k, and assistant prefills
// with a 400, so check the call sites in lib/actions/ai.ts before adding any
// of those.
export const aiModel = process.env.ANTHROPIC_API_KEY ? anthropic("claude-sonnet-5") : null;
