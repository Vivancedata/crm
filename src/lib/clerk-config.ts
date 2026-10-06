export const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

function getClerkServerKey() {
  return process.env.CLERK_SECRET_KEY ?? process.env.CLERK_API_KEY ?? "";
}

export function isClerkClientConfigured() {
  return clerkPublishableKey.length > 0;
}

export function isClerkServerConfigured() {
  return clerkPublishableKey.length > 0 && getClerkServerKey().length > 0;
}

/**
 * Without Clerk server keys the middleware lets every request through. That
 * promise is only honoured when a page can still resolve a user, and only
 * where an unauthenticated CRM is acceptable: local dev and CI. A production
 * deployment that has lost its keys must refuse, never fall back to a shared
 * account.
 */
export function isLocalDevAuth() {
  return !isClerkServerConfigured() && process.env.NODE_ENV !== "production";
}
