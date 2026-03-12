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
