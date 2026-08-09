/**
 * Import prospect companies (and optionally a primary contact) from a CSV.
 *
 * Dry-run by default, like every other script in this fleet. Pass --apply to
 * actually write. An importer that commits several hundred rows on its first
 * invocation is unpleasant to undo, and prospect lists are exactly the kind of
 * data people re-import repeatedly while getting the column mapping right.
 *
 *   npx tsx scripts/import-prospects.ts prospects.csv            # preview only
 *   npx tsx scripts/import-prospects.ts prospects.csv --apply    # write
 *   npx tsx scripts/import-prospects.ts prospects.csv --owner you@example.com
 *
 * Expected columns (header row required, order irrelevant, extras ignored):
 *
 *   name        required  Business name as published
 *   industry    required  CONSTRUCTION | HVAC | PLUMBING | ELECTRICAL |
 *                         LOGISTICS | MANUFACTURING | ... (see Industry enum)
 *   city        optional
 *   state       optional
 *   zip         optional
 *   phone       optional  Business line only -- see the note on personal data
 *   website     optional
 *   employees   optional  A number; mapped to the CompanySize bands
 *   source      optional  Where the row came from, e.g. "TX TDLR license roster"
 *   notes       optional
 *   contact_first / contact_last / contact_title / contact_email
 *               optional  Only fill these from information the business itself
 *                         publishes (an owner named on their own site, a public
 *                         info@ address). Do not load scraped personal inboxes.
 *
 * See docs/PROSPECTING.md for where to source rows lawfully.
 */

import fs from "node:fs";
import path from "node:path";
import { PrismaClient, type Industry, type CompanySize } from "@prisma/client";

const prisma = new PrismaClient();

const VALID_INDUSTRIES = new Set<string>([
  "CONSTRUCTION", "MANUFACTURING", "LOGISTICS", "HVAC", "PLUMBING", "ELECTRICAL",
  "AUTOMOTIVE", "HEALTHCARE", "RETAIL", "RESTAURANT", "AGRICULTURE", "REAL_ESTATE",
  "LEGAL", "FINANCE", "STARTUP", "TECH", "OTHER",
]);

/** The niche the business actually sells to. Rows outside it are flagged, not dropped. */
const CORE_INDUSTRIES = new Set(["CONSTRUCTION", "HVAC", "PLUMBING", "ELECTRICAL", "LOGISTICS", "MANUFACTURING"]);

interface Row {
  [key: string]: string;
}

interface Prepared {
  row: Row;
  lineNo: number;
  name: string;
  industry: Industry;
  size: CompanySize | null;
  problems: string[];
  warnings: string[];
}

/**
 * Minimal RFC4180 reader: handles quoted fields, embedded commas, escaped
 * quotes and CRLF. Deliberately dependency-free -- adding a CSV library to the
 * app's runtime deps for one script is not worth the supply-chain surface.
 */
function parseCsv(text: string): Row[] {
  const rows: string[][] = [];
  let field = "";
  let record: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; }
        else { inQuotes = false; }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') { inQuotes = true; }
    else if (char === ",") { record.push(field); field = ""; }
    else if (char === "\n") { record.push(field); rows.push(record); record = []; field = ""; }
    else if (char !== "\r") { field += char; }
  }
  if (field.length > 0 || record.length > 0) { record.push(field); rows.push(record); }

  const nonEmpty = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (nonEmpty.length === 0) return [];

  const headers = nonEmpty[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return nonEmpty.slice(1).map((cells) => {
    const row: Row = {};
    headers.forEach((h, idx) => { row[h] = (cells[idx] ?? "").trim(); });
    return row;
  });
}

function toSize(employees: string): CompanySize | null {
  const n = Number.parseInt(employees, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n === 1) return "SOLO";
  if (n <= 10) return "SMALL";
  if (n <= 50) return "MEDIUM";
  if (n <= 200) return "LARGE";
  return "ENTERPRISE";
}

/**
 * Dedupe key. Name alone collides across metros (there is a "Precision HVAC" in
 * most of them), and website alone misses the many trades businesses that have
 * none. Name plus city is the pairing that actually discriminates.
 */
function dedupeKey(name: string, city: string): string {
  return `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}|${city.toLowerCase().trim()}`;
}

function prepare(row: Row, lineNo: number): Prepared {
  const problems: string[] = [];
  const warnings: string[] = [];

  const name = (row.name ?? "").trim();
  if (!name) problems.push("missing name");

  const industry = (row.industry ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (!industry) problems.push("missing industry");
  else if (!VALID_INDUSTRIES.has(industry)) problems.push(`unknown industry "${row.industry}"`);
  else if (!CORE_INDUSTRIES.has(industry)) warnings.push(`${industry} is outside the core niche`);

  const size = toSize(row.employees ?? "");
  if (size === "SOLO") warnings.push("solo operator -- usually below the budget line");
  if (size === "ENTERPRISE" || size === "LARGE") warnings.push("large enough to have a procurement cycle");
  if (!row.phone && !row.website && !row.contact_email) warnings.push("no way to reach them");

  const email = (row.contact_email ?? "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push(`malformed contact_email "${email}"`);

  return {
    row, lineNo, name,
    industry: industry as Industry,
    size,
    problems, warnings,
  };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const file = args.find((a) => !a.startsWith("--"));
  const ownerFlagIdx = args.indexOf("--owner");
  const ownerEmail = ownerFlagIdx !== -1 ? args[ownerFlagIdx + 1] : undefined;

  if (!file) {
    console.error("usage: tsx scripts/import-prospects.ts <file.csv> [--apply] [--owner email]");
    process.exitCode = 1;
    return;
  }

  const resolved = path.resolve(file);
  if (!fs.existsSync(resolved)) {
    console.error(`No such file: ${resolved}`);
    process.exitCode = 1;
    return;
  }

  const rows = parseCsv(fs.readFileSync(resolved, "utf8"));
  if (rows.length === 0) {
    console.error("CSV had a header but no data rows.");
    process.exitCode = 1;
    return;
  }

  const owner = ownerEmail
    ? await prisma.user.findUnique({ where: { email: ownerEmail } })
    : await prisma.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } });

  if (!owner) {
    console.error(ownerEmail
      ? `No user with email ${ownerEmail}. Run npm run db:seed first, or pass a different --owner.`
      : "No admin user found. Run npm run db:seed first, or pass --owner <email>.");
    process.exitCode = 1;
    return;
  }

  const prepared = rows.map(prepare);
  const usable = prepared.filter((p) => p.problems.length === 0);
  const rejected = prepared.filter((p) => p.problems.length > 0);

  // Collapse duplicates inside the file itself before touching the database.
  const seen = new Map<string, Prepared>();
  const dupInFile: Prepared[] = [];
  for (const p of usable) {
    const key = dedupeKey(p.name, p.row.city ?? "");
    if (seen.has(key)) dupInFile.push(p);
    else seen.set(key, p);
  }

  const existing = await prisma.company.findMany({ select: { name: true, city: true } });
  const existingKeys = new Set(existing.map((c) => dedupeKey(c.name, c.city ?? "")));

  const toCreate = [...seen.values()].filter((p) => !existingKeys.has(dedupeKey(p.name, p.row.city ?? "")));
  const alreadyPresent = [...seen.values()].filter((p) => existingKeys.has(dedupeKey(p.name, p.row.city ?? "")));

  console.log(`\nRead ${rows.length} row(s) from ${path.basename(resolved)}`);
  console.log(`  ${toCreate.length} new`);
  console.log(`  ${alreadyPresent.length} already in the CRM`);
  console.log(`  ${dupInFile.length} duplicated within the file`);
  console.log(`  ${rejected.length} rejected\n`);

  for (const p of rejected) {
    console.log(`  line ${p.lineNo + 2}: ${p.name || "(no name)"} -- ${p.problems.join("; ")}`);
  }

  const flagged = toCreate.filter((p) => p.warnings.length > 0);
  if (flagged.length > 0) {
    console.log(`\n${flagged.length} row(s) worth a look before you call them:`);
    for (const p of flagged) {
      console.log(`  ${p.name}${p.row.city ? ` (${p.row.city})` : ""} -- ${p.warnings.join("; ")}`);
    }
  }

  if (!apply) {
    console.log("\nDry run. Nothing written. Re-run with --apply to import.\n");
    return;
  }

  let companies = 0;
  let contacts = 0;

  for (const p of toCreate) {
    const company = await prisma.company.create({
      data: {
        name: p.name,
        industry: p.industry,
        size: p.size ?? undefined,
        website: p.row.website || undefined,
        phone: p.row.phone || undefined,
        city: p.row.city || undefined,
        state: p.row.state || undefined,
        zipCode: p.row.zip || undefined,
        country: p.row.country || "USA",
        description: p.row.notes || undefined,
        createdById: owner.id,
      },
    });
    companies += 1;

    const first = (p.row.contact_first ?? "").trim();
    const last = (p.row.contact_last ?? "").trim();
    if (first || last) {
      await prisma.contact.create({
        data: {
          firstName: first || "Unknown",
          lastName: last || "Unknown",
          email: p.row.contact_email || undefined,
          phone: p.row.contact_phone || p.row.phone || undefined,
          title: p.row.contact_title || undefined,
          isPrimary: true,
          source: "COLD_OUTREACH",
          notes: p.row.source ? `Sourced from: ${p.row.source}` : undefined,
          companyId: company.id,
          createdById: owner.id,
        },
      });
      contacts += 1;
    }
  }

  console.log(`\nImported ${companies} compan${companies === 1 ? "y" : "ies"} and ${contacts} contact(s).\n`);
}

main()
  .catch((error) => {
    console.error("Import failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
