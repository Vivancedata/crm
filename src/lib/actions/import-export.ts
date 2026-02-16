"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import {
  INDUSTRY_LABELS,
  COMPANY_SIZE_LABELS,
  CONTACT_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  DEAL_STAGE_LABELS,
  SERVICE_TYPE_LABELS,
  DEAL_STAGE_PROBABILITY,
} from "@/lib/constants";

// ============================================================================
// CSV Utilities
// ============================================================================

function escapeCSVField(value: string | null | undefined): string {
  if (value == null || value === "") return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCSVRow(fields: (string | null | undefined)[]): string {
  return fields.map(escapeCSVField).join(",");
}

function parseCSV(csvData: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];
  let field = "";

  // Normalize line endings
  current = csvData.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < current.length; i++) {
    const char = current[i];

    if (inQuotes) {
      if (char === '"') {
        // Check for escaped quote
        if (i + 1 < current.length && current[i + 1] === '"') {
          field += '"';
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(field.trim());
        field = "";
      } else if (char === "\n") {
        row.push(field.trim());
        if (row.some((f) => f !== "")) {
          rows.push(row);
        }
        row = [];
        field = "";
      } else {
        field += char;
      }
    }
  }

  // Last field/row
  row.push(field.trim());
  if (row.some((f) => f !== "")) {
    rows.push(row);
  }

  return rows;
}

function reverseLookup<K extends string>(
  labels: Record<K, string>,
  input: string
): K | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Try direct enum key match (case-insensitive)
  for (const key of Object.keys(labels) as K[]) {
    if (key.toLowerCase() === trimmed.toLowerCase()) {
      return key;
    }
  }

  // Try label match (case-insensitive)
  for (const key of Object.keys(labels) as K[]) {
    const label = labels[key];
    if (label.toLowerCase() === trimmed.toLowerCase()) return key;
  }

  return null;
}

function getHeaderIndex(
  headers: string[],
  ...candidates: string[]
): number {
  for (const candidate of candidates) {
    const idx = headers.findIndex(
      (h) => h.toLowerCase().replace(/[_\s-]/g, "") === candidate.toLowerCase().replace(/[_\s-]/g, "")
    );
    if (idx !== -1) return idx;
  }
  return -1;
}

function getField(row: string[], index: number): string {
  if (index < 0 || index >= row.length) return "";
  return row[index]?.trim() ?? "";
}

// ============================================================================
// Export Actions
// ============================================================================

export async function exportCompanies(): Promise<string> {
  const user = await requireUser();

  const companies = await prisma.company.findMany({
    where: { createdById: user.id },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Name",
    "Website",
    "Industry",
    "Size",
    "Phone",
    "City",
    "State",
    "Zip",
    "Country",
    "Description",
  ];

  const rows = companies.map((c) =>
    buildCSVRow([
      c.name,
      c.website,
      INDUSTRY_LABELS[c.industry] ?? c.industry,
      COMPANY_SIZE_LABELS[c.size] ?? c.size,
      c.phone,
      c.city,
      c.state,
      c.zipCode,
      c.country,
      c.description,
    ])
  );

  return [headers.join(","), ...rows].join("\n");
}

export async function exportContacts(): Promise<string> {
  const user = await requireUser();

  const contacts = await prisma.contact.findMany({
    where: { createdById: user.id },
    include: { company: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Title",
    "Company",
    "Status",
    "Source",
    "LinkedIn",
  ];

  const rows = contacts.map((c) =>
    buildCSVRow([
      c.firstName,
      c.lastName,
      c.email,
      c.phone,
      c.title,
      c.company?.name ?? "",
      CONTACT_STATUS_LABELS[c.status] ?? c.status,
      c.source ? (LEAD_SOURCE_LABELS[c.source] ?? c.source) : "",
      c.linkedin,
    ])
  );

  return [headers.join(","), ...rows].join("\n");
}

export async function exportDeals(): Promise<string> {
  const user = await requireUser();

  const deals = await prisma.deal.findMany({
    where: { ownerId: user.id },
    include: {
      company: { select: { name: true } },
      contact: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Title",
    "Value",
    "Stage",
    "Probability",
    "Service Type",
    "Company",
    "Contact",
    "Expected Close",
    "Description",
  ];

  const rows = deals.map((d) =>
    buildCSVRow([
      d.title,
      d.value ? String(d.value) : "",
      DEAL_STAGE_LABELS[d.stage] ?? d.stage,
      String(d.probability),
      SERVICE_TYPE_LABELS[d.serviceType] ?? d.serviceType,
      d.company?.name ?? "",
      d.contact
        ? `${d.contact.firstName} ${d.contact.lastName}`
        : "",
      d.expectedClose ? d.expectedClose.toISOString().split("T")[0] : "",
      d.description,
    ])
  );

  return [headers.join(","), ...rows].join("\n");
}

// ============================================================================
// Import Actions
// ============================================================================

type ImportResult = {
  created: number;
  errors: { row: number; message: string }[];
};

type IndustryKey = keyof typeof INDUSTRY_LABELS;
type CompanySizeKey = keyof typeof COMPANY_SIZE_LABELS;
type ContactStatusKey = keyof typeof CONTACT_STATUS_LABELS;
type LeadSourceKey = keyof typeof LEAD_SOURCE_LABELS;
type DealStageKey = keyof typeof DEAL_STAGE_LABELS;
type ServiceTypeKey = keyof typeof SERVICE_TYPE_LABELS;

type CompanyImportData = {
  name: string;
  website: string | null;
  industry: IndustryKey;
  size: CompanySizeKey;
  phone: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string;
  description: string | null;
  createdById: string;
};

type ContactImportData = {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  companyId: string | null;
  status: ContactStatusKey;
  source: LeadSourceKey | null;
  linkedin: string | null;
  createdById: string;
};

type DealImportData = {
  title: string;
  value: number | null;
  stage: DealStageKey;
  probability: number;
  serviceType: ServiceTypeKey;
  companyId: string | null;
  contactId: string | null;
  expectedClose: Date | null;
  description: string | null;
  ownerId: string;
};

export async function importCompanies(csvData: string): Promise<ImportResult> {
  const user = await requireUser();
  const rows = parseCSV(csvData);

  if (rows.length < 2) {
    return { created: 0, errors: [{ row: 1, message: "No data rows found" }] };
  }

  const headers = rows[0].map((h) => h.toLowerCase());
  const dataRows = rows.slice(1);

  const nameIdx = getHeaderIndex(headers, "name", "companyname", "company");
  const websiteIdx = getHeaderIndex(headers, "website", "url");
  const industryIdx = getHeaderIndex(headers, "industry");
  const sizeIdx = getHeaderIndex(headers, "size", "companysize");
  const phoneIdx = getHeaderIndex(headers, "phone", "telephone");
  const cityIdx = getHeaderIndex(headers, "city");
  const stateIdx = getHeaderIndex(headers, "state", "province");
  const zipIdx = getHeaderIndex(headers, "zip", "zipcode", "postalcode");
  const countryIdx = getHeaderIndex(headers, "country");
  const descIdx = getHeaderIndex(headers, "description", "desc", "notes");

  const errors: { row: number; message: string }[] = [];
  let created = 0;

  const validRows: Array<{ rowNum: number; data: CompanyImportData }> = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = i + 2; // 1-indexed, skip header

    const name = getField(row, nameIdx);
    if (!name) {
      errors.push({ row: rowNum, message: "Company name is required" });
      continue;
    }

    const industryRaw = getField(row, industryIdx);
    const industry = industryRaw
      ? reverseLookup(INDUSTRY_LABELS, industryRaw)
      : null;
    if (industryRaw && !industry) {
      errors.push({
        row: rowNum,
        message: `Invalid industry: "${industryRaw}"`,
      });
      continue;
    }

    const sizeRaw = getField(row, sizeIdx);
    const size = sizeRaw ? reverseLookup(COMPANY_SIZE_LABELS, sizeRaw) : null;
    if (sizeRaw && !size) {
      errors.push({
        row: rowNum,
        message: `Invalid company size: "${sizeRaw}"`,
      });
      continue;
    }

    validRows.push({
      rowNum,
      data: {
        name,
        website: getField(row, websiteIdx) || null,
        industry: industry ?? "OTHER",
        size: size ?? "SMALL",
        phone: getField(row, phoneIdx) || null,
        city: getField(row, cityIdx) || null,
        state: getField(row, stateIdx) || null,
        zipCode: getField(row, zipIdx) || null,
        country: getField(row, countryIdx) || "USA",
        description: getField(row, descIdx) || null,
        createdById: user.id,
      },
    });
  }

  if (validRows.length > 0) {
    try {
      await prisma.$transaction(
        validRows.map(({ data }) => prisma.company.create({ data }))
      );
      created = validRows.length;
    } catch (err) {
      logger.warn("Import companies transaction failed", { action: "importCompanies", userId: user.id, error: err instanceof Error ? err.message : String(err) });
      errors.push({
        row: 0,
        message: `Import failed: ${err instanceof Error ? err.message : "Transaction error"}. No records were created.`,
      });
      created = 0;
    }
  }

  logger.info("Import completed", { action: "importCompanies", userId: user.id, created: String(created), errorCount: String(errors.length) });
  revalidatePath("/companies");
  revalidatePath("/");
  return { created, errors };
}

export async function importContacts(csvData: string): Promise<ImportResult> {
  const user = await requireUser();
  const rows = parseCSV(csvData);

  if (rows.length < 2) {
    return { created: 0, errors: [{ row: 1, message: "No data rows found" }] };
  }

  const headers = rows[0].map((h) => h.toLowerCase());
  const dataRows = rows.slice(1);

  const firstNameIdx = getHeaderIndex(headers, "firstname", "first", "first name");
  const lastNameIdx = getHeaderIndex(headers, "lastname", "last", "last name");
  const emailIdx = getHeaderIndex(headers, "email", "emailaddress");
  const phoneIdx = getHeaderIndex(headers, "phone", "telephone");
  const titleIdx = getHeaderIndex(headers, "title", "jobtitle", "job title");
  const companyIdx = getHeaderIndex(headers, "company", "companyname", "company name");
  const statusIdx = getHeaderIndex(headers, "status", "contactstatus");
  const sourceIdx = getHeaderIndex(headers, "source", "leadsource", "lead source");
  const linkedinIdx = getHeaderIndex(headers, "linkedin", "linkedinurl");

  // Pre-fetch user's companies for matching
  const userCompanies = await prisma.company.findMany({
    where: { createdById: user.id },
    select: { id: true, name: true },
  });

  const companyMap = new Map(
    userCompanies.map((c) => [c.name.toLowerCase(), c.id])
  );

  const errors: { row: number; message: string }[] = [];
  let created = 0;

  const validRows: Array<{ rowNum: number; data: ContactImportData }> = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = i + 2;

    const firstName = getField(row, firstNameIdx);
    const lastName = getField(row, lastNameIdx);

    if (!firstName || !lastName) {
      errors.push({
        row: rowNum,
        message: "First name and last name are required",
      });
      continue;
    }

    const statusRaw = getField(row, statusIdx);
    const status = statusRaw
      ? reverseLookup(CONTACT_STATUS_LABELS, statusRaw)
      : null;
    if (statusRaw && !status) {
      errors.push({
        row: rowNum,
        message: `Invalid status: "${statusRaw}"`,
      });
      continue;
    }

    const sourceRaw = getField(row, sourceIdx);
    const source = sourceRaw
      ? reverseLookup(LEAD_SOURCE_LABELS, sourceRaw)
      : null;
    if (sourceRaw && !source) {
      errors.push({
        row: rowNum,
        message: `Invalid lead source: "${sourceRaw}"`,
      });
      continue;
    }

    // Match company by name
    const companyName = getField(row, companyIdx);
    let companyId: string | null = null;
    if (companyName) {
      companyId = companyMap.get(companyName.toLowerCase()) ?? null;
    }

    validRows.push({
      rowNum,
      data: {
        firstName,
        lastName,
        email: getField(row, emailIdx) || null,
        phone: getField(row, phoneIdx) || null,
        title: getField(row, titleIdx) || null,
        companyId,
        status: status ?? "ACTIVE",
        source: source ?? null,
        linkedin: getField(row, linkedinIdx) || null,
        createdById: user.id,
      },
    });
  }

  if (validRows.length > 0) {
    try {
      await prisma.$transaction(
        validRows.map(({ data }) => prisma.contact.create({ data }))
      );
      created = validRows.length;
    } catch (err) {
      logger.warn("Import contacts transaction failed", { action: "importContacts", userId: user.id, error: err instanceof Error ? err.message : String(err) });
      errors.push({
        row: 0,
        message: `Import failed: ${err instanceof Error ? err.message : "Transaction error"}. No records were created.`,
      });
      created = 0;
    }
  }

  logger.info("Import completed", { action: "importContacts", userId: user.id, created: String(created), errorCount: String(errors.length) });
  revalidatePath("/contacts");
  revalidatePath("/");
  return { created, errors };
}

export async function importDeals(csvData: string): Promise<ImportResult> {
  const user = await requireUser();
  const rows = parseCSV(csvData);

  if (rows.length < 2) {
    return { created: 0, errors: [{ row: 1, message: "No data rows found" }] };
  }

  const headers = rows[0].map((h) => h.toLowerCase());
  const dataRows = rows.slice(1);

  const titleIdx = getHeaderIndex(headers, "title", "dealtitle", "deal title", "name");
  const valueIdx = getHeaderIndex(headers, "value", "dealvalue", "amount");
  const stageIdx = getHeaderIndex(headers, "stage", "dealstage");
  const probabilityIdx = getHeaderIndex(headers, "probability", "winprobability");
  const serviceTypeIdx = getHeaderIndex(headers, "servicetype", "service type", "service");
  const companyIdx = getHeaderIndex(headers, "company", "companyname", "company name");
  const contactIdx = getHeaderIndex(headers, "contact", "contactname", "contact name");
  const expectedCloseIdx = getHeaderIndex(headers, "expectedclose", "expected close", "closedate", "close date");
  const descIdx = getHeaderIndex(headers, "description", "desc", "notes");

  // Pre-fetch user's companies and contacts for matching
  const [userCompanies, userContacts] = await Promise.all([
    prisma.company.findMany({
      where: { createdById: user.id },
      select: { id: true, name: true },
    }),
    prisma.contact.findMany({
      where: { createdById: user.id },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  const companyMap = new Map(
    userCompanies.map((c) => [c.name.toLowerCase(), c.id])
  );
  const contactMap = new Map(
    userContacts.map((c) => [
      `${c.firstName} ${c.lastName}`.toLowerCase(),
      c.id,
    ])
  );

  const errors: { row: number; message: string }[] = [];
  let created = 0;

  const validRows: Array<{ rowNum: number; data: DealImportData }> = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = i + 2;

    const title = getField(row, titleIdx);
    if (!title) {
      errors.push({ row: rowNum, message: "Deal title is required" });
      continue;
    }

    const stageRaw = getField(row, stageIdx);
    const stage = stageRaw
      ? reverseLookup(DEAL_STAGE_LABELS, stageRaw)
      : null;
    if (stageRaw && !stage) {
      errors.push({
        row: rowNum,
        message: `Invalid deal stage: "${stageRaw}"`,
      });
      continue;
    }

    const serviceTypeRaw = getField(row, serviceTypeIdx);
    const serviceType = serviceTypeRaw
      ? reverseLookup(SERVICE_TYPE_LABELS, serviceTypeRaw)
      : null;
    if (serviceTypeRaw && !serviceType) {
      errors.push({
        row: rowNum,
        message: `Invalid service type: "${serviceTypeRaw}"`,
      });
      continue;
    }

    const valueRaw = getField(row, valueIdx);
    let value: number | null = null;
    if (valueRaw) {
      // Remove currency symbols and commas
      const cleaned = valueRaw.replace(/[$,\s]/g, "");
      const parsed = parseFloat(cleaned);
      if (isNaN(parsed)) {
        errors.push({
          row: rowNum,
          message: `Invalid deal value: "${valueRaw}"`,
        });
        continue;
      }
      value = parsed;
    }

    const probabilityRaw = getField(row, probabilityIdx);
    let probability: number | undefined;
    if (probabilityRaw) {
      const parsed = parseInt(probabilityRaw.replace("%", ""), 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        probability = parsed;
      }
    }

    const expectedCloseRaw = getField(row, expectedCloseIdx);
    let expectedClose: Date | null = null;
    if (expectedCloseRaw) {
      const parsed = new Date(expectedCloseRaw);
      if (!isNaN(parsed.getTime())) {
        expectedClose = parsed;
      }
    }

    // Match company and contact by name
    const companyName = getField(row, companyIdx);
    const companyId = companyName
      ? companyMap.get(companyName.toLowerCase()) ?? null
      : null;

    const contactName = getField(row, contactIdx);
    const contactId = contactName
      ? contactMap.get(contactName.toLowerCase()) ?? null
      : null;

    const resolvedStage: DealStageKey = stage ?? "LEAD";
    const resolvedServiceType: ServiceTypeKey = serviceType ?? "CONSULTING";

    validRows.push({
      rowNum,
      data: {
        title,
        value,
        stage: resolvedStage,
        probability:
          probability ?? DEAL_STAGE_PROBABILITY[resolvedStage] ?? 10,
        serviceType: resolvedServiceType,
        companyId,
        contactId,
        expectedClose,
        description: getField(row, descIdx) || null,
        ownerId: user.id,
      },
    });
  }

  if (validRows.length > 0) {
    try {
      await prisma.$transaction(
        validRows.map(({ data }) => prisma.deal.create({ data }))
      );
      created = validRows.length;
    } catch (err) {
      logger.warn("Import deals transaction failed", { action: "importDeals", userId: user.id, error: err instanceof Error ? err.message : String(err) });
      errors.push({
        row: 0,
        message: `Import failed: ${err instanceof Error ? err.message : "Transaction error"}. No records were created.`,
      });
      created = 0;
    }
  }

  logger.info("Import completed", { action: "importDeals", userId: user.id, created: String(created), errorCount: String(errors.length) });
  revalidatePath("/deals");
  revalidatePath("/");
  return { created, errors };
}
