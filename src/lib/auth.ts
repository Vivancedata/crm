import { currentUser } from "@clerk/nextjs/server";
import { isClerkServerConfigured, isLocalDevAuth } from "@/lib/clerk-config";
import { LOCAL_DEV_USER } from "@/lib/dev-user";
import { UnauthorizedError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

async function getLocalDevUser() {
  return prisma.user.upsert({
    where: { clerkId: LOCAL_DEV_USER.clerkId },
    update: {},
    create: LOCAL_DEV_USER,
  });
}

async function getCurrentUser() {
  // Middleware already waves every request through when the server keys are
  // missing (src/middleware.ts). Outside production, meet it halfway with one
  // deterministic local user so the dashboard renders instead of throwing.
  if (isLocalDevAuth()) return getLocalDevUser();
  if (!isClerkServerConfigured()) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const user = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null,
      avatar: clerkUser.imageUrl,
    },
    create: {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null,
      avatar: clerkUser.imageUrl,
    },
  });

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}
