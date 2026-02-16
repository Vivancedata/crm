"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { contactSchema } from "@/lib/validations/contact";

export async function createContact(formData: unknown) {
  try {
    const user = await requireUser();
    const parsed = contactSchema.parse(formData);

    const companyId = parsed.companyId || null;
    if (companyId) {
      const companyCount = await prisma.company.count({
        where: { id: companyId, createdById: user.id },
      });
      if (companyCount === 0) {
        return { success: false, error: "Invalid company" };
      }
    }

    const contact = await prisma.contact.create({
      data: {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email || null,
        phone: parsed.phone || null,
        title: parsed.title || null,
        companyId,
        isPrimary: parsed.isPrimary,
        linkedin: parsed.linkedin || null,
        notes: parsed.notes || null,
        status: parsed.status,
        source: parsed.source ?? null,
        createdById: user.id,
      },
    });

    revalidatePath("/contacts");
    revalidatePath("/");
    return { success: true, contact };
  } catch (error) {
    logger.error("Failed to create contact", {
      action: "createContact",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function updateContact(id: string, formData: unknown) {
  try {
    const user = await requireUser();
    const parsed = contactSchema.parse(formData);

    const existing = await prisma.contact.findFirst({
      where: { id, createdById: user.id },
    });
    if (!existing) {
      return { success: false, error: "Not found or unauthorized" };
    }

    const companyId = parsed.companyId || null;
    if (companyId) {
      const companyCount = await prisma.company.count({
        where: { id: companyId, createdById: user.id },
      });
      if (companyCount === 0) {
        return { success: false, error: "Invalid company" };
      }
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email || null,
        phone: parsed.phone || null,
        title: parsed.title || null,
        companyId,
        isPrimary: parsed.isPrimary,
        linkedin: parsed.linkedin || null,
        notes: parsed.notes || null,
        status: parsed.status,
        source: parsed.source ?? null,
      },
    });

    revalidatePath("/contacts");
    revalidatePath(`/contacts/${id}`);
    revalidatePath("/");
    return { success: true, contact };
  } catch (error) {
    logger.error("Failed to update contact", {
      action: "updateContact",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function deleteContact(id: string) {
  try {
    const user = await requireUser();

    const existing = await prisma.contact.findFirst({
      where: { id, createdById: user.id },
    });
    if (!existing) {
      return { success: false, error: "Not found or unauthorized" };
    }

    await prisma.contact.delete({ where: { id } });

    revalidatePath("/contacts");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete contact", {
      action: "deleteContact",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}
