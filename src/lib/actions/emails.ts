"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { resend } from "@/lib/resend";
import { logger } from "@/lib/logger";
import { emailSchema, emailTemplateSchema } from "@/lib/validations/email";
import { checkRateLimit } from "@/lib/rate-limit";

export async function sendEmail(formData: unknown) {
  try {
    if (!resend) return { success: false, error: "Email features are not configured" };
    const user = await requireUser();

    const rateLimit = await checkRateLimit(`email:${user.id}`, {
      windowMs: 60_000,
      maxRequests: 20,
    });
    if (rateLimit.error) {
      return { success: false, error: rateLimit.error };
    }
    if (!rateLimit.allowed) {
      return { success: false, error: "Rate limit exceeded. Please wait before sending more emails." };
    }

    const parsed = emailSchema.parse(formData);

    const templateId = parsed.templateId || null;
    if (templateId) {
      const template = await prisma.emailTemplate.findFirst({
        where: { id: templateId, createdById: user.id },
        select: { id: true },
      });
      if (!template) {
        return { success: false, error: "Template not found or unauthorized" };
      }
    }

    const contact = await prisma.contact.findFirst({
      where: { id: parsed.contactId, createdById: user.id },
      select: { id: true, email: true, firstName: true, lastName: true },
    });
    if (!contact) {
      return { success: false, error: "Contact not found or unauthorized" };
    }

    if (!contact.email) {
      return { success: false, error: "Contact does not have an email address" };
    }

    let status: "SENT" | "FAILED" = "SENT";

    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "CRM <noreply@vivancedata.com>",
        to: contact.email,
        subject: parsed.subject,
        html: parsed.body,
      });
    } catch {
      status = "FAILED";
    }

    const email = await prisma.email.create({
      data: {
        subject: parsed.subject,
        body: parsed.body,
        status,
        sentAt: status === "SENT" ? new Date() : null,
        senderId: user.id,
        contactId: parsed.contactId,
        templateId,
      },
    });

    if (status === "SENT") {
      await prisma.activity.create({
        data: {
          type: "EMAIL",
          subject: `Sent email: ${parsed.subject}`,
          description: `Email sent to ${contact.firstName} ${contact.lastName}`,
          userId: user.id,
          contactId: contact.id,
        },
      });
    }

    revalidatePath("/emails");
    revalidatePath(`/contacts/${contact.id}`);
    revalidatePath("/");

    if (status === "FAILED") {
      return { success: false, error: "Failed to send email", email };
    }

    return { success: true, email };
  } catch (error) {
    logger.error("Failed to send email", { action: "sendEmail", error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function saveDraft(formData: unknown) {
  try {
    const user = await requireUser();
    const parsed = emailSchema.parse(formData);

    const templateId = parsed.templateId || null;
    if (templateId) {
      const template = await prisma.emailTemplate.findFirst({
        where: { id: templateId, createdById: user.id },
        select: { id: true },
      });
      if (!template) {
        return { success: false, error: "Template not found or unauthorized" };
      }
    }

    const contact = await prisma.contact.findFirst({
      where: { id: parsed.contactId, createdById: user.id },
      select: { id: true },
    });
    if (!contact) {
      return { success: false, error: "Contact not found or unauthorized" };
    }

    const email = await prisma.email.create({
      data: {
        subject: parsed.subject,
        body: parsed.body,
        status: "DRAFT",
        senderId: user.id,
        contactId: parsed.contactId,
        templateId,
      },
    });

    revalidatePath("/emails");
    return { success: true, email };
  } catch (error) {
    logger.error("Failed to save draft", { action: "saveDraft", error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function deleteEmail(id: string) {
  try {
    const user = await requireUser();

    const existing = await prisma.email.findFirst({
      where: { id, senderId: user.id },
    });
    if (!existing) {
      return { success: false, error: "Not found or unauthorized" };
    }

    await prisma.email.delete({ where: { id } });

    revalidatePath("/emails");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete email", { action: "deleteEmail", error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function createTemplate(formData: unknown) {
  try {
    const user = await requireUser();
    const parsed = emailTemplateSchema.parse(formData);

    const template = await prisma.emailTemplate.create({
      data: {
        name: parsed.name,
        subject: parsed.subject,
        body: parsed.body,
        category: parsed.category || null,
        isActive: parsed.isActive,
        createdById: user.id,
      },
    });

    revalidatePath("/emails");
    return { success: true, template };
  } catch (error) {
    logger.error("Failed to create template", { action: "createTemplate", error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function updateTemplate(id: string, formData: unknown) {
  try {
    const user = await requireUser();
    const parsed = emailTemplateSchema.parse(formData);

    const existing = await prisma.emailTemplate.findFirst({
      where: { id, createdById: user.id },
    });
    if (!existing) {
      return { success: false, error: "Not found or unauthorized" };
    }

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        name: parsed.name,
        subject: parsed.subject,
        body: parsed.body,
        category: parsed.category || null,
        isActive: parsed.isActive,
      },
    });

    revalidatePath("/emails");
    return { success: true, template };
  } catch (error) {
    logger.error("Failed to update template", { action: "updateTemplate", error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function deleteTemplate(id: string) {
  try {
    const user = await requireUser();

    const existing = await prisma.emailTemplate.findFirst({
      where: { id, createdById: user.id },
    });
    if (!existing) {
      return { success: false, error: "Not found or unauthorized" };
    }

    await prisma.emailTemplate.delete({ where: { id } });

    revalidatePath("/emails");
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete template", { action: "deleteTemplate", error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}
