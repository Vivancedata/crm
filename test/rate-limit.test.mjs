import test from "node:test";
import assert from "node:assert/strict";

import rateLimit from "../src/lib/rate-limit.ts";

const { checkRateLimit } = rateLimit;

test("checkRateLimit allows up to maxRequests within a window", async () => {
  const key = `rate-limit:${Date.now()}:${Math.random()}`;

  assert.equal(
    (await checkRateLimit(key, { windowMs: 60_000, maxRequests: 2 })).allowed,
    true
  );
  assert.equal(
    (await checkRateLimit(key, { windowMs: 60_000, maxRequests: 2 })).allowed,
    true
  );
  assert.equal(
    (await checkRateLimit(key, { windowMs: 60_000, maxRequests: 2 })).allowed,
    false
  );
});

test("checkRateLimit resets after the window expires", async () => {
  const key = `rate-limit-reset:${Date.now()}:${Math.random()}`;

  assert.equal(
    (await checkRateLimit(key, { windowMs: 20, maxRequests: 1 })).allowed,
    true
  );
  assert.equal(
    (await checkRateLimit(key, { windowMs: 20, maxRequests: 1 })).allowed,
    false
  );

  await new Promise((r) => setTimeout(r, 25));

  assert.equal(
    (await checkRateLimit(key, { windowMs: 20, maxRequests: 1 })).allowed,
    true
  );
});
