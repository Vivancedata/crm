"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { activitySchema } from "@/lib/validations/activity";

function revalidateEntityPaths(entity: {
  contactId?: string | null;
  companyId?: string | null;
  dealId?: string | null;
}) {
  if (entity.contactId) revalidatePath(`/contacts/${entity.contactId}`);
  if (entity.companyId) revalidatePath(`/companies/${entity.companyId}`);
  if (entity.dealId) revalidatePath(`/deals/${entity.dealId}`);
  revalidatePath("/");
}

export async function logActivity(formData: unknown) {
  try {
    const user = await requireUser();
    const parsed = activitySchema.parse(formData);

    const contactId = parsed.contactId?.trim() || null;
    const companyId = parsed.companyId?.trim() || null;
    const dealId = parsed.dealId?.trim() || null;

    const [contactCount, companyCount, dealCount] = await Promise.all([
      contactId
        ? prisma.contact.count({ where: { id: contactId, createdById: user.id } })
        : Promise.resolve(1),
      companyId
        ? prisma.company.count({ where: { id: companyId, createdById: user.id } })
        : Promise.resolve(1),
      dealId
        ? prisma.deal.count({ where: { id: dealId, ownerId: user.id } })
        : Promise.resolve(1),
    ]);

    if (contactId && contactCount === 0) return { success: false, error: "Invalid contact" };
    if (companyId && companyCount === 0) return { success: false, error: "Invalid company" };
    if (dealId && dealCount === 0) return { success: false, error: "Invalid deal" };

    const activity = await prisma.activity.create({
      data: {
        type: parsed.type,
        subject: parsed.subject,
        description: parsed.description || null,
        duration: parsed.duration || null,
        occurredAt: parsed.occurredAt ? new Date(parsed.occurredAt) : new Date(),
        userId: user.id,
        contactId,
        companyId,
        dealId,
      },
    });

    revalidateEntityPaths({ contactId, companyId, dealId });
    return { success: true, activity };
  } catch (error) {
    logger.error("Failed to log activity", {
      action: "logActivity",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function deleteActivity(id: string) {
  try {
    const user = await requireUser();

    const activity = await prisma.activity.findFirst({
      where: { id, userId: user.id },
    });
    if (!activity) return { success: false, error: "Not found or unauthorized" };

    await prisma.activity.delete({ where: { id } });

    revalidateEntityPaths(activity);
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete activity", {
      action: "deleteActivity",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}
