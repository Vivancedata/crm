import { currentUser } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
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
  if (!user) throw new Error("Unauthorized");
  return user;
}
