import { z } from "zod";

export const dealSchema = z.object({
  title: z.string().min(1, "Deal title is required").max(200),
  value: z.coerce.number().min(0, "Value must be positive").optional(),
  stage: z.enum([
    "LEAD", "QUALIFIED", "DISCOVERY", "PROPOSAL", "NEGOTIATION", "WON", "LOST",
  ]).default("LEAD"),
  probability: z.coerce.number().min(0).max(100).default(10),
  expectedClose: z.string().optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  serviceType: z.enum([
    "CONSULTING", "INTEGRATION", "TRAINING", "SUPPORT", "CUSTOM",
  ]).default("CONSULTING"),
  companyId: z.string().optional().or(z.literal("")),
  contactId: z.string().optional().or(z.literal("")),
  lostReason: z.string().max(500).optional().or(z.literal("")),
});

export type DealFormValues = z.input<typeof dealSchema>;
