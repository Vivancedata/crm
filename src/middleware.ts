import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isClerkServerConfigured } from "@/lib/clerk-config";

/**
 * Clerk v7. authMiddleware and its publicRoutes option are gone; the modern
 * shape inverts the question — protect what matches, rather than list what
 * doesn't — so the sign-in/sign-up pages are the matcher and everything else
 * calls auth.protect().
 */
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

const protectedMiddleware = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect();
});

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  // Without server keys (local dev, CI) the app runs unauthenticated rather
  // than crashing at the edge. Outside production every page then renders as
  // the fixed local dev user (src/lib/auth.ts); in production requireUser()
  // still refuses.
  if (!isClerkServerConfigured()) {
    return NextResponse.next();
  }

  return protectedMiddleware(request, event);
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
