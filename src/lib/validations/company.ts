import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required").max(200),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  industry: z.enum([
    "CONSTRUCTION", "MANUFACTURING", "LOGISTICS", "HVAC", "PLUMBING",
    "ELECTRICAL", "AUTOMOTIVE", "HEALTHCARE", "RETAIL", "RESTAURANT",
    "AGRICULTURE", "REAL_ESTATE", "LEGAL", "FINANCE", "STARTUP", "TECH", "OTHER",
  ]),
  size: z.enum(["SOLO", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]),
  description: z.string().max(2000).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  zipCode: z.string().max(20).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
});

export type CompanyFormValues = z.infer<typeof companySchema>;
