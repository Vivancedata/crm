"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { taskSchema } from "@/lib/validations/task";

export async function createTask(formData: unknown) {
  try {
    const user = await requireUser();
    const parsed = taskSchema.parse(formData);

    const contactId = parsed.contactId || null;
    const dealId = parsed.dealId || null;

    const [contactCount, dealCount] = await Promise.all([
      contactId
        ? prisma.contact.count({ where: { id: contactId, createdById: user.id } })
        : Promise.resolve(1),
      dealId
        ? prisma.deal.count({ where: { id: dealId, ownerId: user.id } })
        : Promise.resolve(1),
    ]);

    if (contactId && contactCount === 0) return { success: false, error: "Invalid contact" };
    if (dealId && dealCount === 0) return { success: false, error: "Invalid deal" };

    const task = await prisma.task.create({
      data: {
        title: parsed.title,
        description: parsed.description || null,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
        priority: parsed.priority,
        contactId,
        dealId,
        assigneeId: user.id,
      },
    });

    revalidatePath("/tasks");
    revalidatePath("/");
    return { success: true, task };
  } catch (error) {
    logger.error("Failed to create task", {
      action: "createTask",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function updateTask(id: string, formData: unknown) {
  try {
    const user = await requireUser();
    const parsed = taskSchema.parse(formData);

    const existing = await prisma.task.findFirst({
      where: { id, assigneeId: user.id },
    });
    if (!existing) {
      return { success: false, error: "Not found or unauthorized" };
    }

    const contactId = parsed.contactId || null;
    const dealId = parsed.dealId || null;

    const [contactCount, dealCount] = await Promise.all([
      contactId
        ? prisma.contact.count({ where: { id: contactId, createdById: user.id } })
        : Promise.resolve(1),
      dealId
        ? prisma.deal.count({ where: { id: dealId, ownerId: user.id } })
        : Promise.resolve(1),
    ]);

    if (contactId && contactCount === 0) return { success: false, error: "Invalid contact" };
    if (dealId && dealCount === 0) return { success: false, error: "Invalid deal" };

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: parsed.title,
        description: parsed.description || null,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
        priority: parsed.priority,
        contactId,
        dealId,
      },
    });

    revalidatePath("/tasks");
    revalidatePath("/");
    return { success: true, task };
  } catch (error) {
    logger.error("Failed to update task", {
      action: "updateTask",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function toggleTaskStatus(id: string) {
  try {
    const user = await requireUser();

    const existing = await prisma.task.findFirst({
      where: { id, assigneeId: user.id },
    });
    if (!existing) {
      return { success: false, error: "Not found or unauthorized" };
    }

    const isCompleting = existing.status !== "COMPLETED";

    const updated = await prisma.task.update({
      where: { id },
      data: {
        status: isCompleting ? "COMPLETED" : "PENDING",
        completedAt: isCompleting ? new Date() : null,
      },
    });

    revalidatePath("/tasks");
    revalidatePath("/");
    return { success: true, task: updated };
  } catch (error) {
    logger.error("Failed to toggle task status", {
      action: "toggleTaskStatus",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function deleteTask(id: string) {
  try {
    const user = await requireUser();

    const existing = await prisma.task.findFirst({
      where: { id, assigneeId: user.id },
    });
    if (!existing) {
      return { success: false, error: "Not found or unauthorized" };
    }

    await prisma.task.delete({ where: { id } });

    revalidatePath("/tasks");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete task", {
      action: "deleteTask",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}
