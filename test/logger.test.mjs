import test from "node:test";
import assert from "node:assert/strict";

import loggerModule from "../src/lib/logger.ts";

const { logger } = loggerModule;

test("logger writes JSON entries with level/message/context", () => {
  const logs = [];
  const original = console.log;
  console.log = (msg) => logs.push(msg);

  try {
    logger.info("hello", { action: "unit-test", userId: "u_123" });
  } finally {
    console.log = original;
  }

  assert.equal(logs.length, 1);

  const entry = JSON.parse(logs[0]);
  assert.equal(entry.level, "info");
  assert.equal(entry.message, "hello");
  assert.equal(entry.action, "unit-test");
  assert.equal(entry.userId, "u_123");
  assert.ok(typeof entry.timestamp === "string" && entry.timestamp.length > 0);
});

