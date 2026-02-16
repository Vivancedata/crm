export const INDUSTRY_LABELS = {
  CONSTRUCTION: "Construction",
  MANUFACTURING: "Manufacturing",
  LOGISTICS: "Logistics",
  HVAC: "HVAC",
  PLUMBING: "Plumbing",
  ELECTRICAL: "Electrical",
  AUTOMOTIVE: "Automotive",
  HEALTHCARE: "Healthcare",
  RETAIL: "Retail",
  RESTAURANT: "Restaurant",
  AGRICULTURE: "Agriculture",
  REAL_ESTATE: "Real Estate",
  LEGAL: "Legal",
  FINANCE: "Finance",
  STARTUP: "Startup",
  TECH: "Tech",
  OTHER: "Other",
} as const;

export const COMPANY_SIZE_LABELS = {
  SOLO: "Solo (1)",
  SMALL: "Small (2-10)",
  MEDIUM: "Medium (11-50)",
  LARGE: "Large (51-200)",
  ENTERPRISE: "Enterprise (200+)",
} as const;

export const DEAL_STAGE_LABELS = {
  LEAD: "Lead",
  QUALIFIED: "Qualified",
  DISCOVERY: "Discovery",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
} as const;

export const SERVICE_TYPE_LABELS = {
  CONSULTING: "Consulting",
  INTEGRATION: "AI Integration",
  TRAINING: "Training",
  SUPPORT: "Support",
  CUSTOM: "Custom Development",
} as const;

export const CONTACT_STATUS_LABELS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  CHURNED: "Churned",
} as const;

export const LEAD_SOURCE_LABELS = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  LINKEDIN: "LinkedIn",
  COLD_OUTREACH: "Cold Outreach",
  EVENT: "Event",
  ADVERTISEMENT: "Advertisement",
  OTHER: "Other",
} as const;

export const PRIORITY_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
} as const;

export const TASK_STATUS_LABELS = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
} as const;

export const DEAL_STAGE_PROBABILITY = {
  LEAD: 10,
  QUALIFIED: 25,
  DISCOVERY: 40,
  PROPOSAL: 60,
  NEGOTIATION: 80,
  WON: 100,
  LOST: 0,
} as const;
