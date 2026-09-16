# Shape: the practice funnel

**Status:** brief, awaiting confirmation. No application code accompanies it.
**Date:** 2026-09-01
**Supersedes:** the five-stage enterprise pipeline in `prisma/schema.prisma` (`DealStage`) and the four-tile dashboard at `/`.

---

## 0. How this was arrived at, and what is assumed

`shape.md` opens with a discovery interview. There was no one to interview, so
every answer below is read off `vivance/PRODUCT.md`, the schema, and the
critique at
`.impeccable/critique/2026-09-02T00-38-08Z__crm-src-app.md`. The assumptions
that would change the design if wrong are marked **[A]** and collected in §8.
Nothing here should be built before those are confirmed.

The decision this brief implements is already recorded in PRODUCT.md:

> Decided 2026-09-01: `learn` and `crm` are **internal tools for the practice**,
> not public products. […] `crm` models the practice's real funnel (call booked →
> assessment → build → retainer) with recurring retainer value, not an
> enterprise five-stage pipeline with win probability.

---

## 1. Job and audience

**Who arrives:** one person. Lorenzo, who scopes the work, builds it and answers
the phone afterwards. Occasionally a project-based collaborator, read-only in
practice. There is no sales team, no manager reviewing a forecast, and no
handoff between roles — the three things a CRM's stage model normally exists to
coordinate.

**Context:** a laptop between calls, or a phone on the way somewhere. Fifteen
minutes on a Monday is the realistic session. The question in his head is not
"what is my pipeline worth", it is **"what have I dropped?"**

**Visitor mode:** returning operator, high context, low patience. Nothing needs
explaining; things need surfacing.

## 2. Outcome and proof

**Primary task:** open the CRM, see the ordered list of things that need him this
week, and act on the top one.

**Success:** he can close the tab in under two minutes having either done the
thing or written down when he will. Failure is the current state — four
equal-weight stat tiles and a board that shows neither how long a deal has sat
nor what happens next, so the answer to "what have I dropped" is *not on the
screen at all*.

**Real evidence the product carries:**

- Deals: **tens, not thousands.** A one-person practice running assessments and
  builds might carry 8–20 live deals and a few years of closed ones. Every
  design decision that assumes scale — pagination, bulk import, CSV export,
  win-probability forecasting — is answering a question this practice does not
  have.
- Money: **a setup fee and a monthly retainer.** PRODUCT.md: *"Assessment from
  $2,500 one-off; Build & Run from $8,000 then from $750/month […] The retainer
  is the product's honest shape, not an upsell."*
- Intake: **a booked call**, from the marketing site's contact form. PRODUCT.md:
  *"The sales motion is a booked call, not a checkout."*

**Product-specific truth a generic CRM cannot claim:** the stages are not
sentiment about how a deal feels, they are **four events where money changes
hands and the nature of the work changes**. A deal in Retainer is not "won and
finished" — it is the revenue, still running, still able to end.

## 3. Selected direction

The design system is settled (`ui/DESIGN.md`, `@vivancedata/ui`) and this is an
established world, so there is no visual-world workshop here. What is materially
open is composition and information architecture, and that is what follows.

**Structural thesis: the pipeline is a sequence of commitments, and the home
screen is a queue, not a dashboard.**

Two consequences, and they are the whole design:

1. **Five stages that each name a commitment**, replacing seven that name a
   feeling. `LEAD / QUALIFIED / DISCOVERY / PROPOSAL / NEGOTIATION` are five
   words for "we have not agreed anything yet"; the practice's funnel has one
   pre-commitment state and then three paid ones.
2. **`/` becomes one ordered list.** Not tiles, not charts. One column of rows,
   each saying what needs doing, why it surfaced, and offering the single action
   that clears it.

**Focal moment:** the first row of that list on a Monday morning.

**Implementation consequence:** the `probability` column and everything computed
from it come out, `value` splits into two fields with different time behaviour,
and `/` stops being a read-only summary and becomes the only screen with a
verb on it.

### The stages

| Stage | What has happened | Money |
|---|---|---|
| `CALL_BOOKED` | A call is in the diary. Nothing is agreed. | none |
| `ASSESSMENT` | The paid readiness assessment is bought and under way. | setup fee (from $2,500) |
| `BUILD` | The build is bought and under way. | setup fee (from $8,000) |
| `RETAINER` | Shipped, in production, being kept running. | monthly (from $750) |
| `CLOSED` | Over, at whatever point. | — |

`RETAINER` is deliberately **terminal but live**: nothing moves out of it except
into `CLOSED`, and a deal sitting there is the practice's income, not an
archived success. This is the single largest departure from the current model,
where `WON` is a graveyard column and monthly income is invisible.

There is no `WON`. A deal that reaches `RETAINER` is the win; a build with no
retainer that ends cleanly is `CLOSED` with a reason saying so. **[A1]**

### Money in the data model

The `value` column conflates two numbers with different behaviour: a one-off,
and a stream. Reports add them together and get something that means nothing.

- `setupFee` — the one-off for the current stage of work. Recognised once.
- `monthlyRetainer` — the recurring figure. Recognised every month it runs.
- `retainerStartedAt` — when the meter started.

Three figures then become computable and honest, and none of them are today:

- **MRR** = Σ `monthlyRetainer` over deals in `RETAINER`.
- **Annual run rate** = MRR × 12.
- **Retainer collected to date** = Σ `monthlyRetainer` × whole months since
  `retainerStartedAt` (to `closedAt` where closed).

Today `/reports` computes "revenue" by summing `value` on `WON` deals and
bucketing it by `serviceType` and by close month. For a practice whose stated
model is *setup fee plus monthly retainer*, that report cannot see most of the
income, and shows a one-off spike in the month a deal closed instead of the
stream it actually became.

### No win probability

`Deal.probability` is removed rather than hidden. It is currently written twice —
a user-editable field in the create and edit dialogs, then silently overwritten
on every stage change by `DEAL_STAGE_PROBABILITY[stage]` in
`src/lib/actions/deals.ts`. So it is a form field whose value is thrown away,
displayed on the deal detail page as though it meant something.

More to the point, a probability is a hedge across a portfolio. One person with
a dozen deals does not have a portfolio; he knows which ones are real. The
number that replaces it on the card is **days in stage** — an observation, not a
guess. (Shipped ahead of this brief in the board hardening PR.)

## 4. Scope and boundaries

**Fidelity:** production, applied to a live internal tool with real data. Not a
prototype.

**Breadth:** the deal model, the board, the home screen and the reports that read
from them. Contacts, companies, tasks, emails, notes and activities keep their
shape.

**Named target:** `crm/`, `main`.

**Untouched:**

- `@vivancedata/ui` and the design system. This is composition, not a new visual
  world.
- Auth, Clerk, middleware.
- The activity model. `Activity` is what makes "went quiet" computable and it
  earns its keep as-is.
- `Company` and `Contact` shapes, including the `Industry` enum — it is one of
  the few things in the schema that already knows this is a trade-services
  practice.

**Anti-goals — things that would look like progress and would not be:**

- Adding stages back "for flexibility". Five is the answer; a configurable stage
  model for one user is a settings screen nobody opens.
- A forecast. Weighted pipeline value is the win-probability idea wearing a hat.
- Making `/` prettier. If it is still four stat tiles at the end, this failed
  whatever it looks like.
- Keeping CSV import "in case". See §6.

## 5. States and ranges

| | minimum | typical | maximum realistic |
|---|---|---|---|
| Live deals (not `CLOSED`) | 0 | 8–20 | ~40 |
| Deals in `RETAINER` | 0 | 3–8 | ~15 |
| Closed deals, all time | 0 | 20–60 | low hundreds |
| Rows in the week list | 0 | 3–8 | ~15 before it stops being a list |
| Contacts | 0 | ~50 | low hundreds |

Material states:

- **First run / empty.** No deals at all. `/` should say what to do (book a call,
  add the one you already booked), not render an empty list with a shrug.
- **Nothing due.** Deals exist, none need anything. This is a *success* state and
  must read as one — "nothing needs you today" — not as an empty state.
- **Overflow.** More than ~15 rows means the thresholds are wrong, not that the
  list needs pagination. Group the tail as "and N more, quieter" rather than
  paginate.
- **First month of a retainer.** `retainerStartedAt` is set and zero whole months
  have elapsed: collected-to-date is $0 and MRR is the full figure. Both are
  correct and the report must not read as a bug.
- **A retainer that ends.** `CLOSED` with `retainerStartedAt` set. It leaves MRR
  the day it closes and stays in collected-to-date forever.
- **Error and loading** for `/` and `/deals` — shipped in the hardening PR.

## 6. Interaction and layout

### `/` — "This week"

One column. Each row is: **subject · why it surfaced · one action.** No tiles
above it, no charts beside it.

Ordering is a rule, not a feeling, and the rule is the design:

1. **Overdue task** on a live deal.
2. **Assessment gone quiet** — in `ASSESSMENT`, no activity in 7 days. **[A2]**
3. **Build gone quiet** — in `BUILD`, no activity in 14 days. **[A2]**
4. **Call booked, not yet met** — in `CALL_BOOKED` for more than 3 days with no
   scheduled task. **[A2]**
5. **Retainer gone quiet** — in `RETAINER`, no activity in 30 days. The client
   is paying monthly; a month of silence is the thing that loses the renewal.
   **[A2]**
6. **Task due this week.**

A single line of running total sits under the list, not over it: live deals,
MRR, next expected close. It is context, not the point.

### `/deals` — four columns and a closed list

Four active columns (`CALL_BOOKED`, `ASSESSMENT`, `BUILD`, `RETAINER`) plus the
collapsed closed list. Board integrity, keyboard drag, card meta and the closed
list are already in the hardening PR; this changes only *which* columns exist.

Retainer cards read differently from the rest — monthly figure and months
running, rather than a close date — because that is the only column where the
number is a rate.

### `/deals/[id]`

The money block becomes setup fee, monthly retainer, retainer start, and
collected-to-date. `Win Probability` goes.

### `/reports`

Retainer first: MRR, annual run rate, retainer collected by month as a stacked
area (one band per client, so a churn is visible as a band ending). One-off fees
become a second, smaller section. "Revenue by service type" goes unless
`serviceType` survives §8 **[A4]**.

### What gets deleted

| What | Where | Lines |
|---|---|---|
| CSV import (3 entity types, preview, per-row errors) | `src/lib/actions/import-export.ts` | 696 |
| Import dialog | `src/components/shared/import-dialog.tsx` | 412 |
| Export button | `src/components/shared/export-button.tsx` | 69 |
| Their six call sites | `contacts/`, `companies/`, `deals/` page headers | ~12 |
| `Deal.probability` and its reads | schema, 2 dialogs, `deals.ts`, `ai.ts`, deal detail | 24 refs |
| `DEAL_STAGE_PROBABILITY` | `src/lib/constants.ts` | 10 |

Roughly **1,200 lines**, and it is the best-built dead weight in the repo — the
import flow has a preview and a per-row error table, which the critique
correctly lists under *What's Working*. It is well-made and it is for a customer
this product does not have. Leads arrive as booked calls from the site's contact
form, one at a time; there is no system to migrate from and nothing downstream
consuming an export. Keeping it means keeping six buttons in three page headers
(the critique's "six buttons per list page header") for a path that is never
taken.

The one real use of export — "get my data out" — is answered by `pg_dump`
against a database only one person uses.

## 7. Migration plan

Three migrations, each independently deployable and each safe to stop after.
The database is small enough that all three are seconds of work; the staging is
for reviewability, not for load.

### Migration 1 — add the money columns, no removals

```prisma
model Deal {
  setupFee          Decimal?  @db.Decimal(12, 2)
  monthlyRetainer   Decimal?  @db.Decimal(12, 2)
  retainerStartedAt DateTime?
  // value, probability, stage unchanged for now
}
```

Backfill: `UPDATE "Deal" SET "setupFee" = "value" WHERE "value" IS NOT NULL;`

`value` is left in place and still written, so a rollback is a redeploy. Nothing
reads the new columns yet.

### Migration 2 — the stage enum

Postgres cannot drop enum values, so this is add-then-swap:

1. `CREATE TYPE "DealStage_new" AS ENUM ('CALL_BOOKED','ASSESSMENT','BUILD','RETAINER','CLOSED');`
2. Add `stage_new` and map:

   | old | new | why |
   |---|---|---|
   | `LEAD`, `QUALIFIED` | `CALL_BOOKED` | nothing is agreed in either |
   | `DISCOVERY` | `ASSESSMENT` | discovery *is* the paid assessment |
   | `PROPOSAL`, `NEGOTIATION` | `CALL_BOOKED` | a proposal is not a commitment; the call is still the live event **[A3]** |
   | `WON` | `RETAINER` if `monthlyRetainer` is set, else `CLOSED` | **[A1]** |
   | `LOST` | `CLOSED` | |

3. Swap the column, drop the old type, rename `lostReason` → `closedReason`.

The `PROPOSAL`/`NEGOTIATION` → `CALL_BOOKED` collapse is the lossy one and
wants a human eye: **[A3]** proposes that any such deal is listed in the PR for
manual reassignment rather than mapped silently.

### Migration 3 — removals

Drop `Deal.probability` and `Deal.value` once nothing reads them; delete the
import/export surface and `DEAL_STAGE_PROBABILITY` in the same change, so the
diff that removes the column also removes its last reader.

### Route map after

| Route | Change |
|---|---|
| `/` | **Rewritten.** One ordered week list. |
| `/deals` | Four columns instead of five; closed list stays. |
| `/deals/[id]` | Money block rewritten; probability gone. |
| `/reports` | Retainer-first; service-type revenue depends on **[A4]**. |
| `/contacts`, `/companies` | Unchanged except the removed header buttons. **[A5]** |
| `/tasks`, `/emails`, `/settings` | Unchanged. |
| `/projects` | Still does not exist. Its nav link is removed in the hardening PR. |

## 8. Open decisions — a builder must not invent these

- **[A1] Is there a "won and finished" that is not a retainer?** This brief
  assumes a build with no retainer is `CLOSED` with a reason, and that `WON`
  deals without a `monthlyRetainer` migrate to `CLOSED`. If a delivered build
  that simply never took a retainer should read as a success rather than a
  closure, the stage list needs a sixth value and the migration changes.
- **[A2] The five quiet-thresholds** (7 / 14 / 3 / 30 days) are invented. They
  are the entire behaviour of the home screen. They should be set by the person
  who will read the list, and they should be constants in one file, not
  scattered.
- **[A3] `PROPOSAL` / `NEGOTIATION` deals** in the live database at migration
  time: map to `CALL_BOOKED`, or list them for manual reassignment? Depends how
  many exist — check before writing the migration, not after.
- **[A4] Does `ServiceType` survive?** Five values (`CONSULTING`, `INTEGRATION`,
  `TRAINING`, `SUPPORT`, `CUSTOM`) for a practice PRODUCT.md says sells one
  engagement shape. If the answer is "the shape is assessment → build →
  retainer", `serviceType` is the stage model repeated, and "revenue by service
  type" is measuring the same thing twice.
- **[A5] Do `Contact` and `Company` stay separate?** A one-person practice deals
  with an owner-operator *at* a firm; two list pages and two detail pages for
  what is usually one relationship may be one screen too many. Out of scope
  here, but it is the next thing this line of reasoning reaches.
- **Retainer billing is not modelled.** MRR × elapsed months assumes every month
  was invoiced and paid. If that is not true, this is a report that lies
  politely, and the honest version needs invoices — a much larger change that
  should be decided on its own merits, not smuggled in here.

## 9. Constraints

- Next.js 15 App Router, React 18.3, Prisma, Postgres. Server components and
  server actions throughout; no client data fetching to add.
- `@vivancedata/ui` for every component. No new local UI components — the
  boundary check enforces it.
- AA contrast, keyboard operability and accessible names are table stakes and
  were brought up to standard in the hardening PR; the week list must not
  regress them. It is a list of links and buttons, which is the easy case.
- Coverage gate: `src/lib/*.ts` at 85% lines/branches/functions. The
  quiet-threshold rules and the retainer arithmetic belong in `src/lib` with
  tests — they are pure functions over dates and decimals, and they are the two
  places where a wrong answer is invisible.

---

## What this brief does not do

It writes no code, chooses no colours, and does not touch the schema. Per
`shape.md`, it stops here and waits for confirmation or one correction round.
The assumptions in §8 are the correction round's agenda.
