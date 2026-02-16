import { z } from "zod";

export const noteSchema = z.object({
  content: z.string().min(1, "Note content is required").max(5000),
  isPinned: z.boolean().default(false),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  dealId: z.string().optional(),
});

export type NoteFormValues = z.input<typeof noteSchema>;
