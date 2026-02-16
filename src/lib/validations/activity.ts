import { z } from "zod";

export const activitySchema = z.object({
  type: z.enum([
    "CALL",
    "EMAIL",
    "MEETING",
    "NOTE",
    "PROPOSAL_SENT",
    "CONTRACT_SIGNED",
  ]),
  subject: z.string().min(1, "Subject is required").max(500),
  description: z.string().max(2000).optional().or(z.literal("")),
  duration: z.coerce.number().min(0, "Duration must be 0 or more").optional(),
  occurredAt: z.string().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  dealId: z.string().optional(),
});

export type ActivityFormValues = z.input<typeof activitySchema>;
