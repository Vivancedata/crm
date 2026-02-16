"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { companySchema } from "@/lib/validations/company";

export async function createCompany(formData: unknown) {
  try {
    const user = await requireUser();
    const parsed = companySchema.parse(formData);

    const company = await prisma.company.create({
      data: {
        ...parsed,
        website: parsed.website || null,
        description: parsed.description || null,
        phone: parsed.phone || null,
        address: parsed.address || null,
        city: parsed.city || null,
        state: parsed.state || null,
        zipCode: parsed.zipCode || null,
        country: parsed.country || "USA",
        createdById: user.id,
      },
    });

    revalidatePath("/companies");
    revalidatePath("/");
    return { success: true, company };
  } catch (error) {
    logger.error("Failed to create company", {
      action: "createCompany",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function updateCompany(id: string, formData: unknown) {
  try {
    const user = await requireUser();
    const parsed = companySchema.parse(formData);

    const existing = await prisma.company.findFirst({
      where: { id, createdById: user.id },
    });
    if (!existing) {
      return { success: false, error: "Not found or unauthorized" };
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...parsed,
        website: parsed.website || null,
        description: parsed.description || null,
        phone: parsed.phone || null,
        address: parsed.address || null,
        city: parsed.city || null,
        state: parsed.state || null,
        zipCode: parsed.zipCode || null,
        country: parsed.country || "USA",
      },
    });

    revalidatePath("/companies");
    revalidatePath(`/companies/${id}`);
    revalidatePath("/");
    return { success: true, company };
  } catch (error) {
    logger.error("Failed to update company", {
      action: "updateCompany",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function deleteCompany(id: string) {
  try {
    const user = await requireUser();

    const existing = await prisma.company.findFirst({
      where: { id, createdById: user.id },
    });
    if (!existing) {
      return { success: false, error: "Not found or unauthorized" };
    }

    await prisma.company.delete({ where: { id } });

    revalidatePath("/companies");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete company", {
      action: "deleteCompany",
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}
