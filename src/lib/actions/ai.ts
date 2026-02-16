"use server";

import { generateText } from "ai";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { aiModel } from "@/lib/ai";
import { logger } from "@/lib/logger";
import { AI_SYSTEM_PROMPT, sanitizeForPrompt } from "@/lib/ai-safety";
import {
  DEAL_STAGE_LABELS,
  SERVICE_TYPE_LABELS,
} from "@/lib/constants";
import { checkRateLimit } from "@/lib/rate-limit";

export async function generateDealInsights(dealId: string) {
  try {
    if (!aiModel) return { success: false as const, error: "AI features are not configured" };
    const user = await requireUser();

    const rateLimit = await checkRateLimit(`ai:${user.id}`, {
      windowMs: 60_000,
      maxRequests: 10,
    });
    if (rateLimit.error) {
      return { success: false as const, error: rateLimit.error };
    }
    if (!rateLimit.allowed) {
      return { success: false as const, error: "Rate limit exceeded. Please wait a moment before trying again." };
    }

    const deal = await prisma.deal.findFirst({
      where: { id: dealId, ownerId: user.id },
      include: {
        company: true,
        contact: true,
        activities: {
          orderBy: { occurredAt: "desc" },
          take: 10,
          include: { user: true },
        },
      },
    });

    if (!deal) {
      throw new Error("Deal not found");
    }

    const activitiesSummary = deal.activities
      .map(
        (a) =>
          `- [${a.type}] ${sanitizeForPrompt(a.subject, 500)}${
            a.description ? `: ${sanitizeForPrompt(a.description, 2000)}` : ""
          } (${a.occurredAt.toLocaleDateString()})`
      )
      .join("\n");

    const prompt = `You are a CRM analyst for an AI consulting firm called Vivancedata. Analyze the following deal and provide insights.

Deal Information:
- Title: ${sanitizeForPrompt(deal.title, 200)}
- Value: ${deal.value ? `$${Number(deal.value).toLocaleString()}` : "Not set"}
- Stage: ${DEAL_STAGE_LABELS[deal.stage] ?? deal.stage}
- Service Type: ${SERVICE_TYPE_LABELS[deal.serviceType] ?? deal.serviceType}
- Win Probability: ${deal.probability}%
- Expected Close: ${deal.expectedClose ? deal.expectedClose.toLocaleDateString() : "Not set"}
- Description: ${deal.description ? sanitizeForPrompt(deal.description, 2000) : "None"}
${
  deal.company
    ? `- Company: ${sanitizeForPrompt(deal.company.name, 200)} (${deal.company.industry}, ${deal.company.size})`
    : "- Company: Not assigned"
}
${
  deal.contact
    ? `- Contact: ${sanitizeForPrompt(`${deal.contact.firstName} ${deal.contact.lastName}`, 200)}${
        deal.contact.title ? ` (${sanitizeForPrompt(deal.contact.title, 200)})` : ""
      }`
    : "- Contact: Not assigned"
}

Recent Activities (last 10):
${activitiesSummary || "No recent activities recorded."}

Please provide your analysis in the following exact format:

SUMMARY:
[A brief 2-3 sentence summary of this deal's current status and outlook]

RISK: [low|medium|high]

NEXT_STEPS:
- [First suggested next step]
- [Second suggested next step]
- [Third suggested next step]

WIN_PROBABILITY:
[Your assessment of the win probability, considering the current stage, activity level, and deal context. 1-2 sentences.]`;

    const { text } = await generateText({
      model: aiModel,
      system: AI_SYSTEM_PROMPT,
      prompt,
    });

    const summaryMatch = text.match(/SUMMARY:\s*([\s\S]*?)(?=\nRISK:)/);
    const riskMatch = text.match(/RISK:\s*(low|medium|high)/i);
    const nextStepsMatch = text.match(/NEXT_STEPS:\s*([\s\S]*?)(?=\nWIN_PROBABILITY:)/);
    const winProbMatch = text.match(/WIN_PROBABILITY:\s*([\s\S]*?)$/);

    const summary = summaryMatch?.[1]?.trim() ?? "Unable to generate summary.";
    const risk = (riskMatch?.[1]?.toLowerCase() ?? "medium") as "low" | "medium" | "high";
    const nextStepsRaw = nextStepsMatch?.[1]?.trim() ?? "";
    const nextSteps = nextStepsRaw
      .split("\n")
      .map((line) => line.replace(/^-\s*/, "").trim())
      .filter(Boolean);
    const winProbability = winProbMatch?.[1]?.trim() ?? "Unable to assess win probability.";

    return {
      success: true as const,
      summary,
      risk,
      nextSteps,
      winProbability,
    };
  } catch (error) {
    logger.error("Failed to generate deal insights", { action: "generateDealInsights", error: error instanceof Error ? error.message : String(error) });
    return { success: false as const, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function generateEmailDraft(
  contactId: string,
  context?: string
) {
  try {
    if (!aiModel) return { success: false as const, error: "AI features are not configured" };
    const user = await requireUser();

    const rateLimit = await checkRateLimit(`ai:${user.id}`, {
      windowMs: 60_000,
      maxRequests: 10,
    });
    if (rateLimit.error) {
      return { success: false as const, error: rateLimit.error };
    }
    if (!rateLimit.allowed) {
      return { success: false as const, error: "Rate limit exceeded. Please wait a moment before trying again." };
    }

    const contact = await prisma.contact.findFirst({
      where: { id: contactId, createdById: user.id },
      include: {
        company: true,
        activities: {
          orderBy: { occurredAt: "desc" },
          take: 5,
          include: { user: true },
        },
      },
    });

    if (!contact) {
      throw new Error("Contact not found");
    }

    const activitiesSummary = contact.activities
      .map(
        (a) =>
          `- [${a.type}] ${sanitizeForPrompt(a.subject, 500)}${
            a.description ? `: ${sanitizeForPrompt(a.description, 2000)}` : ""
          } (${a.occurredAt.toLocaleDateString()})`
      )
      .join("\n");

    const prompt = `You are a professional business development representative at Vivancedata, an AI consulting firm. Draft a professional email to a contact.

Contact Information:
- Name: ${sanitizeForPrompt(`${contact.firstName} ${contact.lastName}`, 200)}
${contact.title ? `- Title: ${sanitizeForPrompt(contact.title, 200)}` : ""}
${contact.company ? `- Company: ${sanitizeForPrompt(contact.company.name, 200)}` : ""}

Recent Interactions:
${activitiesSummary || "No recent interactions recorded."}

Context for this email: ${context ? sanitizeForPrompt(context, 2000) : "Follow up on recent discussions and maintain the relationship."}

Please provide the email in the following exact format:

SUBJECT: [Email subject line]

BODY:
[Full email body text. Keep it concise, professional, and actionable. Do not include placeholders like [Your Name] — sign off as "The Vivancedata Team".]`;

    const { text } = await generateText({
      model: aiModel,
      system: AI_SYSTEM_PROMPT,
      prompt,
    });

    const subjectMatch = text.match(/SUBJECT:\s*(.*)/);
    const bodyMatch = text.match(/BODY:\s*([\s\S]*?)$/);

    const subject = subjectMatch?.[1]?.trim() ?? "Follow Up";
    const body = bodyMatch?.[1]?.trim() ?? text;

    return { success: true as const, subject, body };
  } catch (error) {
    logger.error("Failed to generate email draft", { action: "generateEmailDraft", error: error instanceof Error ? error.message : String(error) });
    return { success: false as const, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function summarizeCompany(companyId: string) {
  try {
    if (!aiModel) return { success: false as const, error: "AI features are not configured" };
    const user = await requireUser();

    const rateLimit = await checkRateLimit(`ai:${user.id}`, {
      windowMs: 60_000,
      maxRequests: 10,
    });
    if (rateLimit.error) {
      return { success: false as const, error: rateLimit.error };
    }
    if (!rateLimit.allowed) {
      return { success: false as const, error: "Rate limit exceeded. Please wait a moment before trying again." };
    }

    const company = await prisma.company.findFirst({
      where: { id: companyId, createdById: user.id },
      include: {
        contacts: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            title: true,
            isPrimary: true,
            status: true,
          },
        },
        deals: {
          select: {
            id: true,
            title: true,
            value: true,
            stage: true,
            probability: true,
            serviceType: true,
          },
        },
        activities: {
          orderBy: { occurredAt: "desc" },
          take: 10,
          include: { user: true },
        },
      },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    const activeDeals = company.deals.filter(
      (d) => d.stage !== "WON" && d.stage !== "LOST"
    );
    const totalDealValue = company.deals.reduce(
      (sum, d) => sum + (d.value ? Number(d.value) : 0),
      0
    );
    const wonDeals = company.deals.filter((d) => d.stage === "WON");

    const contactsList = company.contacts
      .map(
        (c) =>
          `- ${sanitizeForPrompt(`${c.firstName} ${c.lastName}`, 200)}${
            c.title ? ` (${sanitizeForPrompt(c.title, 200)})` : ""
          }${c.isPrimary ? " [Primary]" : ""} — ${c.status}`
      )
      .join("\n");

    const dealsList = company.deals
      .map(
        (d) =>
          `- ${sanitizeForPrompt(d.title, 200)}: ${
            d.value ? `$${Number(d.value).toLocaleString()}` : "No value"
          } — ${DEAL_STAGE_LABELS[d.stage] ?? d.stage} (${
            SERVICE_TYPE_LABELS[d.serviceType] ?? d.serviceType
          })`
      )
      .join("\n");

    const activitiesSummary = company.activities
      .map(
        (a) =>
          `- [${a.type}] ${sanitizeForPrompt(a.subject, 500)} (${a.occurredAt.toLocaleDateString()})`
      )
      .join("\n");

    const prompt = `You are a CRM analyst for Vivancedata, an AI consulting firm. Provide a health summary for this company account.

Company: ${sanitizeForPrompt(company.name, 200)}
Industry: ${company.industry}
Size: ${company.size}
${company.description ? `Description: ${sanitizeForPrompt(company.description, 2000)}` : ""}

Key Contacts (${company.contacts.length}):
${contactsList || "No contacts."}

Deals (${company.deals.length} total, ${activeDeals.length} active, ${wonDeals.length} won):
Total Deal Value: $${totalDealValue.toLocaleString()}
${dealsList || "No deals."}

Recent Activities:
${activitiesSummary || "No recent activities."}

Please provide a company health summary in the following exact format:

RELATIONSHIP_STATUS: [healthy|at-risk|needs-attention|new]

SUMMARY:
[2-3 sentence overview of the relationship health with this company]

KEY_METRICS:
- Total Deal Value: $${totalDealValue.toLocaleString()}
- Active Deals: ${activeDeals.length}
- Total Contacts: ${company.contacts.length}
- Won Deals: ${wonDeals.length}

SUGGESTED_ACTIONS:
- [First suggested action]
- [Second suggested action]
- [Third suggested action]`;

    const { text } = await generateText({
      model: aiModel,
      system: AI_SYSTEM_PROMPT,
      prompt,
    });

    const statusMatch = text.match(
      /RELATIONSHIP_STATUS:\s*(healthy|at-risk|needs-attention|new)/i
    );
    const summaryMatch = text.match(/SUMMARY:\s*([\s\S]*?)(?=\nKEY_METRICS:)/);
    const actionsMatch = text.match(/SUGGESTED_ACTIONS:\s*([\s\S]*?)$/);

    const relationshipStatus = (statusMatch?.[1]?.toLowerCase() ?? "new") as
      | "healthy"
      | "at-risk"
      | "needs-attention"
      | "new";
    const summary = summaryMatch?.[1]?.trim() ?? "Unable to generate summary.";
    const suggestedActions = (actionsMatch?.[1]?.trim() ?? "")
      .split("\n")
      .map((line) => line.replace(/^-\s*/, "").trim())
      .filter(Boolean);

    return {
      success: true as const,
      relationshipStatus,
      summary,
      keyMetrics: {
        totalDealValue,
        activeDeals: activeDeals.length,
        totalContacts: company.contacts.length,
        wonDeals: wonDeals.length,
      },
      suggestedActions,
    };
  } catch (error) {
    logger.error("Failed to summarize company", { action: "summarizeCompany", error: error instanceof Error ? error.message : String(error) });
    return { success: false as const, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}
