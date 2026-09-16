/**
 * Error types the app raises itself, kept apart from the modules that throw
 * them so anything can identify one without importing Clerk or Prisma.
 */

/** Thrown by requireUser() when no user could be resolved for the request. */
export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}
