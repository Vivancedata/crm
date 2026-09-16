/**
 * The one user the CRM runs as when Clerk has no server keys outside
 * production. Fixed identity so every local run, the seed script and any
 * data created between them land on the same row.
 *
 * Kept free of imports so prisma/seed.ts can pull it in under tsx.
 */
export const LOCAL_DEV_USER = {
  clerkId: "local-dev",
  email: "dev@vivancedata.local",
  name: "Local dev",
} as const;
