# Prospecting: who to contact and where to get the list

This is the sourcing side of the CRM. It exists because the fastest way to ruin
a cold outreach motion is to fill the pipeline with names that are wrong,
invented, or obtained in a way you would not want to explain.

## The bar: never load a contact you cannot point at a source for

Every row you import should have a `source` you could name out loud — "Texas
TDLR licensed HVAC contractor roster, pulled 2026-08-08". If you cannot, do not
import it.

Two specific things not to do, both of which feel efficient and are not:

- **Do not invent rows to make the pipeline look busy.** Fabricated prospects
  bounce, and bounces damage your sending domain for the real ones. A pipeline
  of 40 verified businesses outperforms one of 400 guesses.
- **Do not load scraped personal inboxes.** A business line, a published
  `info@`, or an owner named on their own website is fine. A personal address
  harvested from a data broker or LinkedIn scrape is a GDPR/CCPA problem in the
  same jurisdictions our own privacy policy commits us to, and it is the kind of
  thing a prospect notices.

## Where the real lists come from

The trades are unusually well suited to lawful prospecting, because licensing is
public record. These are downloadable, verifiable, and free.

| Source | What you get | Notes |
|---|---|---|
| **State contractor licensing boards** | Licensed business name, license status and class, city, often a business phone | Public record. Most states publish a searchable database and many offer a bulk CSV or a public-records request route. Examples: CA CSLB, TX TDLR, FL DBPR, AZ ROC. Filter by license class to isolate HVAC, electrical, plumbing, general contracting. |
| **DOT / FMCSA carrier census** | Motor carriers with fleet size, operating status, business address | Public federal data, ideal for the logistics niche. Fleet size is a genuine qualification signal. |
| **Trade association member directories** | Member businesses by trade and region | ACCA (HVAC), PHCC (plumbing/HVAC), ABC and AGC (construction). Membership itself signals a business investing in its own operations. |
| **Local permit portals** | Who is pulling permits, and how many | The strongest construction signal available: permit volume is a direct read on paperwork volume, which is the pain being sold against. |
| **Chamber of commerce directories** | Local businesses with published contact details | Small but high-intent; these businesses chose to be listed. |

Export to CSV, map the columns to the header names in
`scripts/import-prospects.ts`, and import.

## Who actually qualifies

The band matters more than the count.

**Target: 5–50 employees.** Below five, the owner is on the tools and there is
neither budget nor enough repetition for automation to pay back. Above roughly
two hundred, there is a procurement process, an IT function with opinions, and a
sales cycle measured in quarters — which a solo practice cannot fund.

Signals worth filtering on, per industry:

- **HVAC / plumbing / electrical** — advertises 24/7 or emergency service. That
  is the after-hours call capture pitch stated in their own words, and it means
  they already know they are losing calls.
- **Construction** — permit-heavy work, multiple concurrent projects,
  subcontractors. Paperwork volume scales with all three.
- **Logistics** — owns a fleet rather than brokering. Proof-of-delivery paperwork
  and damage claims land on asset carriers.
- **Manufacturing** — runs an MES or has sensor data already. If the data does
  not exist, the first engagement is a data project, which is a harder sell.

Disqualify quickly and without regret: no website and no listed phone, licence
lapsed or inactive, or a business that is really a franchise front office where
the decision is made elsewhere.

## What to do with a row once it is in

The sequencing is deliberate, and it follows the one pattern that shows up in
every successful boutique agency: **build something small on their business
before the first call.** The bottleneck in this market is not delivery capacity,
it is buyer belief — the trades have been sold software before and it did not
work.

1. **Qualify** — check the licence is active, the size band fits, and the signal
   above is genuinely present. Move to `QUALIFIED` or drop it.
2. **Build the artefact** — twenty minutes, not two days. Run their own public
   material through the workflow you would sell them: extract the fields from a
   permit PDF they filed, or transcribe and triage a voicemail script for their
   published after-hours line. The output is the pitch.
3. **Reach out with the artefact attached**, not a description of it. Templates
   for this are seeded by `prisma/seed-outreach-templates.ts`.
4. **Discovery call** — one question does most of the work: *what happens to a
   job that comes in at 9pm on a Friday?* Let them describe the failure.
5. **Scope in writing** with a fixed price before any build starts.

## Measuring it honestly

Track reply rate and booked-call rate, not sent volume. Sent volume is trivially
gameable and tells you nothing. If reply rate is under a few percent on a
verified list, the artefact is not landing — change the artefact before
increasing the send count, because volume on a weak message just burns the list.
