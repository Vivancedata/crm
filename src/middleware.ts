import { authMiddleware } from "@clerk/nextjs";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isClerkServerConfigured } from "@/lib/clerk-config";

const clerkMiddleware = authMiddleware({
  publicRoutes: ["/sign-in(.*)", "/sign-up(.*)"],
});

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!isClerkServerConfigured()) {
    return NextResponse.next();
  }

  return clerkMiddleware(request, event);
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
