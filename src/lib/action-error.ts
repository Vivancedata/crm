import type { Prisma } from "@prisma/client";
import type { ZodError } from "zod";

/**
 * Turns whatever a server action caught into a sentence a person can act on.
 *
 * Actions used to return `error.message` verbatim, so the toast could read
 * "Invalid `prisma.deal.create()` invocation: Unique constraint failed on the
 * fields: (`email`)". The raw message still goes to the server log; the client
 * gets the plain-language version.
 *
 * Errors are matched on `name`, not `instanceof`. Zod and Prisma each ship both
 * an ESM and a CJS build, and a process that loads one of each ends up with two
 * distinct `ZodError` classes -- so `instanceof` returns false for a real
 * validation error and every message silently degrades to the fallback. `name`
 * is set in the constructor of all of these and survives the duplication.
 */
export function toUserMessage(error: unknown, fallback = "Something went wrong. Try again."): string {
  if (!(error instanceof Error)) return fallback;

  switch (error.name) {
    case "UnauthorizedError":
      return "Your session has ended. Sign in again.";

    case "ZodError":
      return firstIssueMessage(error as ZodError);

    case "PrismaClientKnownRequestError":
      return knownRequestMessage(error as Prisma.PrismaClientKnownRequestError, fallback);

    case "PrismaClientInitializationError":
    case "PrismaClientRustPanicError":
      return "The database is not reachable right now. Try again in a moment.";

    default:
      return fallback;
  }
}

function firstIssueMessage(error: ZodError): string {
  const issue = error.issues?.[0];
  if (!issue) return "Check the form and try again.";

  const field = issue.path.map(String).join(".");
  return field ? `Check the form: ${field} ${lowerFirst(issue.message)}.` : issue.message;
}

function knownRequestMessage(error: Prisma.PrismaClientKnownRequestError, fallback: string): string {
  switch (error.code) {
    case "P2002": {
      const target = error.meta?.target;
      const field = Array.isArray(target) ? target.join(", ") : null;
      return field
        ? `A record with that ${field} already exists.`
        : "A record like this already exists.";
    }
    case "P2025":
      return "That record no longer exists. Refresh the page.";
    case "P2003":
      return "This record is still linked to other records and cannot be changed.";
    default:
      return fallback;
  }
}

function lowerFirst(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}
