"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { dealSchema } from "@/lib/validations/deal";
import { DEAL_STAGE_PROBABILITY } from "@/lib/constants";

export async function createDeal(formData: unknown) {
  try {
    const user = await requireUser();
    const parsed = dealSchema.parse(formData);

    const companyId = parsed.companyId || null;
    const contactId = parsed.contactId || null;

    const [companyCount, contactCount] = await Promise.all([
      companyId
        ? prisma.company.count({ where: { id: companyId, createdById: user.id } })
        : Promise.resolve(1),
      contactId
        ? prisma.contact.count({ where: { id: contactId, createdById: user.id } })
        : Promise.resolve(1),
    ]);

    if (companyId && companyCount === 0) return { success: false, error: "Invalid company" };
    if (contactId && contactCount === 0) return { success: false, error: "Invalid contact" };

    const deal = await prisma.deal.create({
      data: {
        title: parsed.title,
        value: parsed.value ?? null,
        stage: parsed.stage,
        probability: DEAL_STAGE_PROBABILITY[parsed.stage] ?? parsed.probability,
        expectedClose: parsed.expectedClose ? new Date(parsed.expectedClose) : null,
        description: parsed.description || null,
        serviceType: parsed.serviceType,
        companyId,
        contactId,
        ownerId: user.id,
      },
    });

    revalidatePath("/deals");
    revalidatePath("/");
    return { success: true, deal };
  } catch (error) {
    logger.error("Failed to create deal", {
      action: "createDeal",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function updateDeal(id: string, formData: unknown) {
  try {
    const user = await requireUser();
    const parsed = dealSchema.parse(formData);

    const existing = await prisma.deal.findFirst({
      where: { id, ownerId: user.id },
    });
    if (!existing) {
      return { success: false, error: "Not found or unauthorized" };
    }

    const companyId = parsed.companyId || null;
    const contactId = parsed.contactId || null;

    const [companyCount, contactCount] = await Promise.all([
      companyId
        ? prisma.company.count({ where: { id: companyId, createdById: user.id } })
        : Promise.resolve(1),
      contactId
        ? prisma.contact.count({ where: { id: contactId, createdById: user.id } })
        : Promise.resolve(1),
    ]);

    if (companyId && companyCount === 0) return { success: false, error: "Invalid company" };
    if (contactId && contactCount === 0) return { success: false, error: "Invalid contact" };

    const deal = await prisma.deal.update({
      where: { id },
      data: {
        title: parsed.title,
        value: parsed.value ?? null,
        stage: parsed.stage,
        probability: DEAL_STAGE_PROBABILITY[parsed.stage] ?? parsed.probability,
        expectedClose: parsed.expectedClose ? new Date(parsed.expectedClose) : null,
        description: parsed.description || null,
        serviceType: parsed.serviceType,
        companyId,
        contactId,
        lostReason: parsed.lostReason || null,
        actualClose:
          parsed.stage === "WON" || parsed.stage === "LOST" ? new Date() : null,
      },
    });

    revalidatePath("/deals");
    revalidatePath(`/deals/${id}`);
    revalidatePath("/");
    return { success: true, deal };
  } catch (error) {
    logger.error("Failed to update deal", {
      action: "updateDeal",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function updateDealStage(id: string, stage: string) {
  try {
    const user = await requireUser();
    const validStages = [
      "LEAD", "QUALIFIED", "DISCOVERY", "PROPOSAL", "NEGOTIATION", "WON", "LOST",
    ] as const;
    type ValidStage = (typeof validStages)[number];

    function isValidStage(value: string): value is ValidStage {
      return (validStages as readonly string[]).includes(value);
    }

    if (!isValidStage(stage)) {
      return { success: false, error: "Invalid stage" };
    }

    const typedStage = stage;

    const existing = await prisma.deal.findFirst({
      where: { id, ownerId: user.id },
    });
    if (!existing) {
      return { success: false, error: "Not found or unauthorized" };
    }

    const deal = await prisma.deal.update({
      where: { id },
      data: {
        stage: typedStage,
        probability: DEAL_STAGE_PROBABILITY[typedStage] ?? 0,
        actualClose:
          typedStage === "WON" || typedStage === "LOST" ? new Date() : null,
      },
    });

    await prisma.activity.create({
      data: {
        type: "DEAL_STAGE_CHANGE",
        subject: `Deal moved to ${stage}`,
        dealId: id,
        userId: user.id,
        companyId: deal.companyId,
        contactId: deal.contactId,
      },
    });

    revalidatePath("/deals");
    revalidatePath(`/deals/${id}`);
    revalidatePath("/");
    return { success: true, deal };
  } catch (error) {
    logger.error("Failed to update deal stage", {
      action: "updateDealStage",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function deleteDeal(id: string) {
  try {
    const user = await requireUser();

    const existing = await prisma.deal.findFirst({
      where: { id, ownerId: user.id },
    });
    if (!existing) {
      return { success: false, error: "Not found or unauthorized" };
    }

    await prisma.deal.delete({ where: { id } });

    revalidatePath("/deals");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete deal", {
      action: "deleteDeal",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}
