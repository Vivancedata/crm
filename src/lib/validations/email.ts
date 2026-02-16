import { z } from "zod";

export const emailSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(500),
  body: z.string().min(1, "Body is required").max(10000),
  contactId: z.string().min(1, "Contact is required"),
  templateId: z.string().optional().or(z.literal("")),
});

export type EmailFormValues = z.input<typeof emailSchema>;

export const emailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(200),
  subject: z.string().min(1, "Subject is required").max(500),
  body: z.string().min(1, "Body is required").max(10000),
  category: z.string().max(100).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type EmailTemplateFormValues = z.input<typeof emailTemplateSchema>;
