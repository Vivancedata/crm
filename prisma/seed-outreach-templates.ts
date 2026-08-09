/**
 * Seeds the outreach email templates for the blue-collar niche.
 *
 *   npx tsx prisma/seed-outreach-templates.ts
 *
 * Idempotent: upserts on template name, so re-running updates copy in place
 * rather than accumulating duplicates.
 *
 * Placeholders are {{double_braced}} and are filled per-send. They are
 * deliberately specific -- {{artefact_detail}} exists so that no template can
 * be sent without naming the concrete thing that was built first. A template
 * that reads fine with every placeholder empty is a template that will go out
 * as generic mail.
 *
 * Copy rules these follow, and any new template should:
 *   - Short. Owner-operators read on a phone between jobs.
 *   - One ask, and the ask is small.
 *   - No statistics. We have none, and the recipient has been sold fake ones
 *     before by everyone else who emailed them.
 *   - Say the specific thing that was built. The artefact is the pitch.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TemplateSeed {
  name: string;
  subject: string;
  category: string;
  body: string;
}

const templates: TemplateSeed[] = [
  {
    name: "Cold — HVAC / trades, after-hours calls",
    category: "Cold Outreach",
    subject: "the calls that come in after you close",
    body: `Hi {{first_name}},

I saw {{company}} advertises {{after_hours_claim}}. Out of curiosity I called the line after hours and {{artefact_detail}}.

I build small systems for trades businesses that answer those calls, take the job details down in a consistent format, and either book the routine work or page whoever is on call if it actually is an emergency.

I put together a short recording of what that would sound like on your line. Happy to send it over — no call needed unless you want one.

{{sender_name}}
{{sender_title}}`,
  },
  {
    name: "Cold — Construction, document intake",
    category: "Cold Outreach",
    subject: "{{permit_reference}} — pulled the fields out automatically",
    body: `Hi {{first_name}},

{{company}} filed {{permit_reference}} recently. I ran it through a document extraction workflow I build for contractors — {{artefact_detail}}.

The idea is that submittals, permits and supplier invoices stop being re-keyed by someone who should be on site. It reads the document, checks it against your own rules, and writes it into whatever project system you already run.

I can send you the extracted output from your own filing so you can judge the accuracy yourself. Worth a look?

{{sender_name}}
{{sender_title}}`,
  },
  {
    name: "Cold — Logistics, proof of delivery",
    category: "Cold Outreach",
    subject: "the POD paperwork bottleneck",
    body: `Hi {{first_name}},

Quick question for {{company}} — how long after a delivery does the paperwork actually reach billing?

For most carriers I talk to the answer is days, because a driver photographs a signed POD and then somebody types it in. I build the piece in between: it reads the photo, matches it to the load, and pushes clean data into the TMS, flagging the ones too illegible to trust rather than guessing.

{{artefact_detail}}

If that is a real bottleneck for you I can show you what it does on your own documents.

{{sender_name}}
{{sender_title}}`,
  },
  {
    name: "Follow-up 1 — no reply",
    category: "Follow-up",
    subject: "Re: {{original_subject}}",
    body: `Hi {{first_name}},

Following up on the note below — I know this time of year is busy.

The offer stands: I will run {{artefact_detail}} and send you the output, no charge and no call required. If it is useless you will know in about thirty seconds and we both save time.

{{sender_name}}`,
  },
  {
    name: "Follow-up 2 — closing the loop",
    category: "Follow-up",
    subject: "Re: {{original_subject}}",
    body: `Hi {{first_name}},

I will stop emailing after this one.

If the {{pain_point}} problem becomes worth solving later, reply to this and I will pick it back up. Otherwise, best of luck with {{season_reference}}.

{{sender_name}}`,
  },
  {
    name: "Post-call — scope and fixed price",
    category: "Proposal",
    subject: "{{company}} — scope for {{workflow_name}}",
    body: `Hi {{first_name}},

Good to talk. Writing down what we agreed so there are no surprises.

The problem: {{problem_statement}}

What I would build: {{scope_summary}}

What it does not cover: {{out_of_scope}}

Timeline: {{timeline}}
Build: {{setup_price}}
Running it afterwards: {{monthly_price}} per month, covering monitoring, upstream API changes and accuracy checks. Cancellable with 30 days' notice, and you can take a handover-only build instead if you would rather run it yourself.

How we would know it worked: {{success_criteria}}

If that reads right, say so and I will send the agreement. If anything is off, tell me which part.

{{sender_name}}`,
  },
];

async function main(): Promise<void> {
  const owner = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  });

  if (!owner) {
    console.error("No admin user found. Run `npm run db:seed` first.");
    process.exitCode = 1;
    return;
  }

  // Seeded concurrently rather than in a loop. Each template is keyed by its own
  // name and the names above are distinct, so no two of these touch the same row
  // -- there is no ordering constraint to preserve and nothing to serialise for.
  // `upsert` is not available here because `name` is not unique in the schema,
  // so it stays find-then-write; that is safe for a seed script run by hand, but
  // it would race if two copies ran at once.
  const results = await Promise.all(
    templates.map(async (template) => {
      const existing = await prisma.emailTemplate.findFirst({ where: { name: template.name } });

      if (existing) {
        await prisma.emailTemplate.update({
          where: { id: existing.id },
          data: { subject: template.subject, body: template.body, category: template.category },
        });
        return `updated  ${template.name}`;
      }

      await prisma.emailTemplate.create({
        data: { ...template, createdById: owner.id },
      });
      return `created  ${template.name}`;
    })
  );

  for (const line of results) console.log(line);

  console.log(`\n${templates.length} outreach templates seeded.`);
  console.log("Fill every {{placeholder}} before sending. See docs/PROSPECTING.md.\n");
}

main()
  .catch((error) => {
    console.error("Seeding outreach templates failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
