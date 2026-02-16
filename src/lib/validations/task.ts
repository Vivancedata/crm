import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  contactId: z.string().optional().or(z.literal("")),
  dealId: z.string().optional().or(z.literal("")),
});

export type TaskFormValues = z.input<typeof taskSchema>;
