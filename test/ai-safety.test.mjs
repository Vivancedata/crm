import test from "node:test";
import assert from "node:assert/strict";

import aiSafety from "../src/lib/ai-safety.ts";

const { sanitizeForPrompt } = aiSafety;

test("sanitizeForPrompt strips control characters", () => {
  const out = sanitizeForPrompt("a\u0000b\u0007c\n", 100);
  assert.equal(out, "abc");
});

test("sanitizeForPrompt truncates long text", () => {
  const out = sanitizeForPrompt("abcdefgh", 5);
  assert.ok(out.startsWith("abcde"));
  assert.ok(out.includes("[truncated]"));
});

