import test from "node:test";
import assert from "node:assert/strict";

import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { toUserMessage } from "../src/lib/action-error.ts";
import { UnauthorizedError } from "../src/lib/errors.ts";

const prismaKnown = (code, meta) =>
  new Prisma.PrismaClientKnownRequestError("Invalid `prisma.deal.create()` invocation", {
    code,
    clientVersion: "5.8.0",
    meta,
  });

test("an expired session says so instead of 'Unauthorized'", () => {
  assert.equal(toUserMessage(new UnauthorizedError()), "Your session has ended. Sign in again.");
});

test("a validation failure names the field", () => {
  const err = new ZodError([
    { code: "too_small", minimum: 1, type: "string", inclusive: true, path: ["email"], message: "Required" },
  ]);
  assert.equal(toUserMessage(err), "Check the form: email required.");
});

test("a validation failure with no path falls back to the issue message", () => {
  const err = new ZodError([
    { code: "custom", path: [], message: "At least one field is required" },
  ]);
  assert.equal(toUserMessage(err), "At least one field is required");
});

test("an empty validation failure still says something actionable", () => {
  assert.equal(toUserMessage(new ZodError([])), "Check the form and try again.");
});

test("a unique-constraint clash names the field, not the Prisma call", () => {
  const message = toUserMessage(prismaKnown("P2002", { target: ["email"] }));
  assert.equal(message, "A record with that email already exists.");
  assert.ok(!message.includes("prisma."));
});

test("a unique-constraint clash without a target stays plain", () => {
  assert.equal(toUserMessage(prismaKnown("P2002", {})), "A record like this already exists.");
});

test("a missing record asks for a refresh", () => {
  assert.equal(toUserMessage(prismaKnown("P2025")), "That record no longer exists. Refresh the page.");
});

test("a foreign-key clash explains the link", () => {
  assert.equal(
    toUserMessage(prismaKnown("P2003")),
    "This record is still linked to other records and cannot be changed."
  );
});

test("an unmapped Prisma code uses the caller's fallback", () => {
  assert.equal(toUserMessage(prismaKnown("P2010"), "Couldn't create deal."), "Couldn't create deal.");
});

test("an unreachable database reads as a transient failure", () => {
  const err = new Prisma.PrismaClientInitializationError("Can't reach database server", "5.8.0");
  assert.equal(toUserMessage(err), "The database is not reachable right now. Try again in a moment.");
});

test("anything else uses the fallback and never leaks the raw message", () => {
  const err = new Error("connect ECONNREFUSED 127.0.0.1:5432");
  assert.equal(toUserMessage(err), "Something went wrong. Try again.");
  assert.equal(toUserMessage(err, "Couldn't send email."), "Couldn't send email.");
  assert.equal(toUserMessage("a bare string"), "Something went wrong. Try again.");
});
