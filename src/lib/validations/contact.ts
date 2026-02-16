import { z } from "zod";

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  title: z.string().max(200).optional().or(z.literal("")),
  companyId: z.string().optional().or(z.literal("")),
  isPrimary: z.boolean().default(false),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE", "CHURNED"]).default("ACTIVE"),
  source: z
    .enum(["WEBSITE", "REFERRAL", "LINKEDIN", "COLD_OUTREACH", "EVENT", "ADVERTISEMENT", "OTHER"])
    .optional()
    .nullable(),
});

export type ContactFormValues = z.input<typeof contactSchema>;
