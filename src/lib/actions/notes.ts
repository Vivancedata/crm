"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { noteSchema } from "@/lib/validations/note";

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

export async function createNote(formData: unknown) {
  try {
    const user = await requireUser();
    const parsed = noteSchema.parse(formData);

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

    const note = await prisma.note.create({
      data: {
        content: parsed.content,
        isPinned: parsed.isPinned ?? false,
        authorId: user.id,
        contactId,
        companyId,
        dealId,
      },
    });

    revalidateEntityPaths({ contactId, companyId, dealId });
    return { success: true, note };
  } catch (error) {
    logger.error("Failed to create note", {
      action: "createNote",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function updateNote(id: string, formData: unknown) {
  try {
    const user = await requireUser();
    const parsed = noteSchema.parse(formData);

    const existing = await prisma.note.findFirst({
      where: { id, authorId: user.id },
    });
    if (!existing) {
      return { success: false, error: "Not found or unauthorized" };
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        content: parsed.content,
        isPinned: parsed.isPinned ?? false,
      },
    });

    revalidateEntityPaths(parsed);
    return { success: true, note };
  } catch (error) {
    logger.error("Failed to update note", {
      action: "updateNote",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function toggleNotePin(id: string) {
  try {
    const user = await requireUser();

    const existing = await prisma.note.findFirst({
      where: { id, authorId: user.id },
    });
    if (!existing) {
      return { success: false, error: "Not found or unauthorized" };
    }

    const note = await prisma.note.update({
      where: { id },
      data: { isPinned: !existing.isPinned },
    });

    revalidateEntityPaths(existing);
    return { success: true, note };
  } catch (error) {
    logger.error("Failed to toggle note pin", {
      action: "toggleNotePin",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function deleteNote(id: string) {
  try {
    const user = await requireUser();

    const existing = await prisma.note.findFirst({
      where: { id, authorId: user.id },
    });
    if (!existing) {
      return { success: false, error: "Not found or unauthorized" };
    }

    await prisma.note.delete({ where: { id } });

    revalidateEntityPaths(existing);
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete note", {
      action: "deleteNote",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}
