import test from "node:test";
import assert from "node:assert/strict";

import rateLimit from "../src/lib/rate-limit.ts";
import prismaModule from "../src/lib/prisma.ts";
import loggerModule from "../src/lib/logger.ts";

const { checkRateLimit } = rateLimit;
const { prisma } = prismaModule;
const { logger } = loggerModule;

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

test("checkRateLimit uses the DB store when configured", async (t) => {
  const originalStore = process.env.RATE_LIMIT_STORE;
  const originalTransaction = prisma.$transaction;

  process.env.RATE_LIMIT_STORE = "db";
  prisma.$transaction = async (callback) =>
    callback({
      rateLimit: {
        findUnique: async () => null,
        upsert: async () => undefined,
      },
    });

  t.after(() => {
    process.env.RATE_LIMIT_STORE = originalStore;
    prisma.$transaction = originalTransaction;
  });

  const result = await checkRateLimit("db-store:create", {
    windowMs: 60_000,
    maxRequests: 2,
  });

  assert.deepEqual(result, { allowed: true, retryAfterMs: 0 });
});

test("checkRateLimit returns retryAfterMs when the DB-backed window is exhausted", async (t) => {
  const originalStore = process.env.RATE_LIMIT_STORE;
  const originalTransaction = prisma.$transaction;

  process.env.RATE_LIMIT_STORE = "db";
  prisma.$transaction = async (callback) =>
    callback({
      rateLimit: {
        findUnique: async () => ({
          count: 2,
          resetAt: new Date(Date.now() + 45_000),
        }),
      },
    });

  t.after(() => {
    process.env.RATE_LIMIT_STORE = originalStore;
    prisma.$transaction = originalTransaction;
  });

  const result = await checkRateLimit("db-store:blocked", {
    windowMs: 60_000,
    maxRequests: 2,
  });

  assert.equal(result.allowed, false);
  assert.ok(result.retryAfterMs > 0);
});

test("checkRateLimit defaults to the DB store in production", async (t) => {
  const originalStore = process.env.RATE_LIMIT_STORE;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalTransaction = prisma.$transaction;

  delete process.env.RATE_LIMIT_STORE;
  process.env.NODE_ENV = "production";
  prisma.$transaction = async (callback) =>
    callback({
      rateLimit: {
        findUnique: async () => ({
          count: 1,
          resetAt: new Date(Date.now() + 60_000),
        }),
        update: async () => undefined,
      },
    });

  t.after(() => {
    if (originalStore === undefined) {
      delete process.env.RATE_LIMIT_STORE;
    } else {
      process.env.RATE_LIMIT_STORE = originalStore;
    }
    process.env.NODE_ENV = originalNodeEnv;
    prisma.$transaction = originalTransaction;
  });

  const result = await checkRateLimit("db-store:production-default", {
    windowMs: 60_000,
    maxRequests: 3,
  });

  assert.deepEqual(result, { allowed: true, retryAfterMs: 0 });
});

test("checkRateLimit surfaces a friendly error when the DB store fails", async (t) => {
  const originalStore = process.env.RATE_LIMIT_STORE;
  const originalTransaction = prisma.$transaction;
  const originalLoggerError = logger.error;
  const loggedErrors = [];

  process.env.RATE_LIMIT_STORE = "db";
  prisma.$transaction = async () => {
    throw new Error("db unavailable");
  };
  logger.error = (message, context) => {
    loggedErrors.push({ message, context });
  };

  t.after(() => {
    process.env.RATE_LIMIT_STORE = originalStore;
    prisma.$transaction = originalTransaction;
    logger.error = originalLoggerError;
  });

  const result = await checkRateLimit("db-store:error", {
    windowMs: 60_000,
    maxRequests: 2,
  });

  assert.equal(result.allowed, false);
  assert.equal(result.retryAfterMs, 60_000);
  assert.match(result.error, /not available/i);
  assert.equal(loggedErrors.length, 1);
  assert.equal(loggedErrors[0].message, "Rate limit DB check failed");
});
