# Vivancedata CRM

<p align="center">
  <img src="docs/assets/hero.png" alt="crm preview" width="640">
</p>

A modern CRM built for AI consulting businesses, specifically designed to serve startups and blue-collar industries (construction, HVAC, manufacturing, logistics, etc.).

---

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Data Model](#data-model)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development Commands](#development-commands)
- [Project Structure](#project-structure)
- [Route Map](#route-map)
- [Server Actions](#server-actions)
- [AI Features](#ai-features)
- [Import / Export](#import--export)
- [Design System](#design-system)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core CRM
- **Contact Management** -- Track people, their companies, and relationships
- **Company Profiles** -- Industry tagging, size, location, and notes
- **Deal Pipeline** -- Kanban-style pipeline (Lead -> Qualified -> Discovery -> Proposal -> Negotiation -> Won/Lost)
- **Activity Timeline** -- Log calls, emails, meetings, and notes
- **Task Management** -- Follow-up reminders with priority levels
- **Global Search** -- Cmd+K search across contacts, companies, and deals

### Consulting-Specific
- **Project Tracking** -- Manage active engagements after deals close
- **Service Types** -- Consulting, Integration, Training, Support, Custom
- **Industry Tags** -- Construction, Manufacturing, HVAC, Logistics, Startup, and 11 more
- **Time Tracking** -- Log hours and hourly rates for billing

### Communication
- **Email Templates** -- Reusable templates for outreach (categorised: Cold Outreach, Follow-up, Proposal, etc.)
- **Email Sending** -- Send emails via Resend (deliverability depends on your domain setup)
- **Activity Logging** -- Log communications and follow-ups

### AI-Powered (Optional)
- **Deal Insights** -- AI-generated risk assessment, next steps, and win probability analysis per deal
- **Email Drafting** -- AI-composed emails based on contact context and recent interactions
- **Company Summaries** -- Relationship health scoring (healthy / at-risk / needs-attention / new) with suggested actions
- **Safety** -- All AI prompts use a system-level safety layer with input sanitisation and injection guardrails

### Analytics
- **Pipeline Dashboard** -- Total value, deal counts by stage
- **Conversion Metrics** -- Win rate, average deal size
- **Activity Reports** -- Team productivity tracking
- **Revenue Charts** -- Recharts-powered visual reporting
- **Lead Source Breakdown** -- Track where your best leads come from

### Data Management
- **CSV Import** -- Bulk-import companies, contacts, and deals from CSV files
- **CSV Export** -- Export any entity to CSV for external analysis
- **Notifications** -- In-app notification system with popover

---

## Architecture Overview

```
Browser
  |
  v
Clerk Auth Middleware ──> /sign-in, /sign-up (public)
  |
  v
Next.js 15 App Router
  |
  ├── (dashboard)/ layout ──> Sidebar + Header + Notifications
  │     |
  │     ├── Server Components (pages) ──> Prisma queries (read)
  │     │     └── pass data as props to Client Components
  │     │
  │     └── Client Components ──> call Server Actions (write)
  │           └── src/lib/actions/*.ts
  │                 ├── requireUser()        (auth check, Clerk -> DB upsert)
  │                 ├── Zod validation       (src/lib/validations/*.ts)
  │                 ├── Prisma mutation       (src/lib/prisma.ts)
  │                 └── revalidatePath()     (refresh affected pages)
  │
  └── layout.tsx (root) ──> ClerkProvider + globals.css
        |
        v
PostgreSQL (via Prisma ORM)
```

Key architectural decisions:

| Decision | Detail |
|----------|--------|
| **No API routes** | All mutations go through Next.js Server Actions in `src/lib/actions/` |
| **Server Components by default** | Pages fetch data directly with Prisma; client components receive data as props |
| **Auth via Clerk** | Middleware protects all routes except `/sign-in` and `/sign-up`; `requireUser()` upserts the Clerk identity into the local `User` table |
| **Validation** | Every mutation validates input with a Zod schema from `src/lib/validations/` |
| **Rate limiting** | AI actions are rate-limited (10 req/min per user) with configurable store (in-memory for dev, PostgreSQL for production) |
| **Structured logging** | JSON-formatted logs via `src/lib/logger.ts` with configurable `LOG_LEVEL` |

---

## Data Model

The Prisma schema (`prisma/schema.prisma`) models a full CRM pipeline. All records are scoped to the authenticated user.

```
User (synced from Clerk)
 |
 ├── Company
 │     ├── Contact (belongs to Company, optional)
 │     ├── Deal (belongs to Company + Contact)
 │     │     └── Project (1:1, post-sale delivery)
 │     ├── Activity
 │     └── Note
 │
 ├── Deal ──> stages: Lead -> Qualified -> Discovery -> Proposal -> Negotiation -> Won -> Lost
 │     ├── Activity
 │     ├── Task
 │     └── Note
 │
 ├── Task (assignable to Contact, Deal, or Project)
 ├── Activity (linkable to Contact, Company, Deal, or Project)
 ├── Email -> Contact (sent via Resend)
 ├── EmailTemplate
 └── Note (attachable to Contact, Company, Deal, or Project)
```

### Enums

| Enum | Values |
|------|--------|
| **Industry** | Construction, Manufacturing, Logistics, HVAC, Plumbing, Electrical, Automotive, Healthcare, Retail, Restaurant, Agriculture, Real Estate, Legal, Finance, Startup, Tech, Other |
| **CompanySize** | Solo (1), Small (2-10), Medium (11-50), Large (51-200), Enterprise (200+) |
| **DealStage** | Lead (10%), Qualified (25%), Discovery (40%), Proposal (60%), Negotiation (80%), Won (100%), Lost (0%) |
| **ServiceType** | Consulting, AI Integration, Training, Support, Custom Development |
| **ContactStatus** | Active, Inactive, Churned |
| **LeadSource** | Website, Referral, LinkedIn, Cold Outreach, Event, Advertisement, Other |
| **Priority** | Low, Medium, High, Urgent |
| **TaskStatus** | Pending, In Progress, Completed, Cancelled |
| **ProjectStatus** | Not Started, In Progress, On Hold, Completed, Cancelled |
| **ActivityType** | Call, Email, Meeting, Note, Task Completed, Deal Stage Change, Proposal Sent, Contract Signed |
| **EmailStatus** | Draft, Scheduled, Sent, Opened, Clicked, Bounced, Failed |

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + @vivancedata/ui |
| Database | PostgreSQL + Prisma ORM |
| Auth | Clerk |
| Email | Resend |
| AI | Anthropic (Claude) via Vercel AI SDK |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table v8 |
| Charts | Recharts |
| Drag & Drop | dnd-kit (Kanban board) |
| Command Palette | cmdk |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+ (or Bun)
- PostgreSQL database (local or hosted, e.g. Railway, Neon, Supabase)
- Clerk account (for authentication)
- Resend account (for email sending -- optional)
- Anthropic API key (for AI features -- optional)

### Installation

```bash
# Clone the repo
git clone https://github.com/Vivancedata/crm.git
cd crm

# Install dependencies
npm install
# Note: --legacy-peer-deps is configured in .npmrc

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials (see table below)

# Generate Prisma client
npx prisma generate

# Apply database migrations
npm run db:migrate
# For quick prototyping without migration history: npm run db:push

# Seed with sample data (optional)
npm run db:seed

# Start development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:password@localhost:5432/vivancedata_crm` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key (from dashboard) | `pk_test_...` |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key (from dashboard) | `sk_test_...` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | No | Sign-in page path (default: `/sign-in`) | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | No | Sign-up page path (default: `/sign-up`) | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | No | Redirect after sign-in (default: `/`) | `/` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | No | Redirect after sign-up (default: `/`) | `/` |
| `RESEND_API_KEY` | No | Resend API key for sending emails | `re_...` |
| `EMAIL_FROM` | No | Default "from" address for outbound emails | `CRM <noreply@vivancedata.com>` |
| `ANTHROPIC_API_KEY` | No | Anthropic API key for AI features (deal insights, email drafts, company summaries) | `sk-ant-...` |
| `LOG_LEVEL` | No | Minimum log level: `info`, `warn`, or `error` (default: `info`) | `info` |
| `RATE_LIMIT_STORE` | No | Rate limiting backend: `memory` (dev) or `db` (production). Auto-selected by `NODE_ENV` if omitted | `db` |

---

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next.js development server on `localhost:3000` |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint with zero-warning threshold |
| `npm run test` | Run tests via Node.js built-in test runner (`node --test`) |
| `npm run db:push` | Push `prisma/schema.prisma` to the database (no migration history -- dev only) |
| `npm run db:migrate` | Create and apply a Prisma migration (recommended for production) |
| `npm run db:deploy` | Apply pending migrations without creating new ones (CI/CD) |
| `npm run db:status` | Check migration status against the database |
| `npm run db:studio` | Open Prisma Studio GUI at `localhost:5555` |
| `npm run db:seed` | Seed the database with sample data (`tsx prisma/seed.ts`) |
| `npx prisma generate` | Regenerate the Prisma client (also runs automatically on `postinstall`) |

After changing `prisma/schema.prisma`, run `npm run db:push` (dev) or `npm run db:migrate` (production). The Prisma client is auto-generated via the `postinstall` script.

---

## Project Structure

```
vivancedata-crm/
├── prisma/
│   ├── schema.prisma              # Data model (all entities, enums, relations)
│   ├── seed.ts                    # Database seeder (tsx)
│   └── migrations/                # Prisma migration history
│       ├── 20260215120000_init/
│       └── 20260215121500_add_rate_limit/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (ClerkProvider, fonts, globals)
│   │   ├── globals.css            # Tailwind base + custom CSS properties
│   │   ├── sign-in/[[...sign-in]]/page.tsx   # Clerk sign-in
│   │   ├── sign-up/[[...sign-up]]/page.tsx   # Clerk sign-up
│   │   └── (dashboard)/           # Authenticated route group
│   │       ├── layout.tsx         # Sidebar + Header + Notifications
│   │       ├── page.tsx           # Dashboard home (stats, pipeline, tasks, activity)
│   │       ├── contacts/
│   │       │   ├── page.tsx       # Contact list (DataTable + create/import/export)
│   │       │   └── [id]/page.tsx  # Contact detail (info, notes, activities, tasks)
│   │       ├── companies/
│   │       │   ├── page.tsx       # Company list
│   │       │   └── [id]/page.tsx  # Company detail
│   │       ├── deals/
│   │       │   ├── page.tsx       # Deal pipeline (Kanban + table views)
│   │       │   └── [id]/page.tsx  # Deal detail + AI insights
│   │       ├── tasks/
│   │       │   └── page.tsx       # Task management (tabbed: pending, in-progress, completed)
│   │       ├── emails/
│   │       │   └── page.tsx       # Email history + template manager
│   │       ├── reports/
│   │       │   └── page.tsx       # Analytics (pipeline, revenue, activity, lead source charts)
│   │       └── settings/
│   │           └── page.tsx       # Settings (profile, preferences, API keys)
│   ├── middleware.ts               # Clerk auth middleware (protects all non-public routes)
│   ├── components/
│   │   ├── ui/                    # Base UI primitives (Radix-based, shadcn/ui pattern)
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── data-table.tsx     # Generic DataTable (TanStack Table)
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── textarea.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx        # Main navigation sidebar
│   │   │   └── header.tsx         # Top header bar
│   │   ├── shared/                # Reusable page-level components
│   │   │   ├── page-header.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── command-search.tsx # Cmd+K global search (cmdk)
│   │   │   ├── notifications-popover.tsx
│   │   │   ├── export-button.tsx
│   │   │   └── import-dialog.tsx
│   │   ├── dashboard/
│   │   │   ├── stats.tsx          # KPI stat cards
│   │   │   ├── pipeline-overview.tsx
│   │   │   ├── upcoming-tasks.tsx
│   │   │   └── recent-activity.tsx
│   │   ├── contacts/
│   │   │   ├── contact-table.tsx
│   │   │   ├── create-contact-dialog.tsx
│   │   │   ├── edit-contact-dialog.tsx
│   │   │   └── delete-contact-dialog.tsx
│   │   ├── companies/
│   │   │   ├── company-table.tsx
│   │   │   ├── create-company-dialog.tsx
│   │   │   ├── edit-company-dialog.tsx
│   │   │   └── delete-company-dialog.tsx
│   │   ├── deals/
│   │   │   ├── deal-kanban.tsx    # Drag-and-drop Kanban board (dnd-kit)
│   │   │   ├── deal-card.tsx      # Kanban card
│   │   │   ├── create-deal-dialog.tsx
│   │   │   ├── edit-deal-dialog.tsx
│   │   │   └── delete-deal-dialog.tsx
│   │   ├── tasks/
│   │   │   ├── task-table.tsx
│   │   │   ├── task-list-tabs.tsx
│   │   │   ├── create-task-dialog.tsx
│   │   │   ├── edit-task-dialog.tsx
│   │   │   └── delete-task-dialog.tsx
│   │   ├── emails/
│   │   │   ├── email-table.tsx
│   │   │   ├── compose-email-dialog.tsx
│   │   │   └── template-manager.tsx
│   │   ├── notes/
│   │   │   ├── note-list.tsx
│   │   │   └── create-note-dialog.tsx
│   │   ├── activities/
│   │   │   ├── activity-timeline.tsx
│   │   │   └── log-activity-dialog.tsx
│   │   ├── reports/
│   │   │   ├── reports-content.tsx
│   │   │   ├── stats-card.tsx
│   │   │   ├── pipeline-chart.tsx
│   │   │   ├── revenue-chart.tsx
│   │   │   ├── activity-chart.tsx
│   │   │   └── lead-source-chart.tsx
│   │   ├── settings/
│   │   │   ├── profile-tab.tsx
│   │   │   ├── preferences-tab.tsx
│   │   │   └── api-keys-tab.tsx
│   │   └── ai/
│   │       ├── deal-insights.tsx  # AI-generated deal analysis widget
│   │       └── email-draft-button.tsx
│   └── lib/
│       ├── prisma.ts              # Singleton Prisma client (global cache in dev)
│       ├── auth.ts                # getCurrentUser() / requireUser() (Clerk -> DB)
│       ├── constants.ts           # Display labels for all Prisma enums
│       ├── utils.ts               # General utilities (cn, etc.)
│       ├── ai.ts                  # Anthropic model config (Vercel AI SDK)
│       ├── ai-safety.ts           # AI system prompt + input sanitisation
│       ├── resend.ts              # Resend email client
│       ├── logger.ts              # Structured JSON logger
│       ├── rate-limit.ts          # Rate limiter (memory or DB-backed)
│       ├── validations/           # Zod schemas (one file per domain)
│       │   ├── company.ts
│       │   ├── contact.ts
│       │   ├── deal.ts
│       │   ├── task.ts
│       │   ├── note.ts
│       │   ├── activity.ts
│       │   └── email.ts
│       └── actions/               # Server Actions (one file per domain)
│           ├── companies.ts
│           ├── contacts.ts
│           ├── deals.ts
│           ├── tasks.ts
│           ├── notes.ts
│           ├── activities.ts
│           ├── emails.ts
│           ├── ai.ts              # AI actions (deal insights, email drafts, company summary)
│           ├── search.ts          # Global search across entities
│           ├── import-export.ts   # CSV import/export for companies, contacts, deals
│           ├── notifications.ts
│           └── settings.ts
├── .env.example                   # Template for environment variables
├── .npmrc                         # legacy-peer-deps=true
├── vercel.json                    # Vercel config (install + build commands)
├── tailwind.config.ts
├── tsconfig.json                  # Path alias: @/* -> ./src/*
├── postcss.config.mjs
└── package.json
```

---

## Route Map

All authenticated routes live under the `(dashboard)` route group and share a sidebar + header layout.

| Path | Page | Description |
|------|------|-------------|
| `/` | Dashboard | KPI stats, pipeline overview, upcoming tasks, recent activity |
| `/contacts` | Contact List | Searchable DataTable with create, import, and export |
| `/contacts/[id]` | Contact Detail | Profile, notes, activity timeline, associated tasks and deals |
| `/companies` | Company List | Searchable DataTable with create, import, and export |
| `/companies/[id]` | Company Detail | Profile, contacts, deals, notes, activity timeline |
| `/deals` | Deal Pipeline | Kanban board (drag-and-drop) and table views with create, import, and export |
| `/deals/[id]` | Deal Detail | Deal info, AI insights, notes, activities, tasks |
| `/tasks` | Task Management | Tabbed view (Pending, In Progress, Completed) with CRUD |
| `/emails` | Email Center | Email history table + template manager + compose |
| `/reports` | Analytics | Pipeline, revenue, activity, and lead source charts |
| `/settings` | Settings | Profile, preferences, and API key management |
| `/sign-in` | Sign In | Clerk sign-in (public) |
| `/sign-up` | Sign Up | Clerk sign-up (public) |

---

## Server Actions

All data mutations are handled by Server Actions in `src/lib/actions/`. Each action follows a consistent pattern:

1. **Authenticate** -- Call `requireUser()` to verify the session and upsert the Clerk user into the database
2. **Validate** -- Parse input with the corresponding Zod schema from `src/lib/validations/`
3. **Mutate** -- Execute the Prisma operation
4. **Revalidate** -- Call `revalidatePath()` to refresh affected pages

| Action File | Operations |
|-------------|------------|
| `companies.ts` | Create, update, delete companies |
| `contacts.ts` | Create, update, delete contacts |
| `deals.ts` | Create, update, delete deals; move between pipeline stages |
| `tasks.ts` | Create, update, delete, complete tasks |
| `notes.ts` | Create, update, delete notes (attachable to any entity) |
| `activities.ts` | Log activities (calls, emails, meetings, etc.) |
| `emails.ts` | Compose, send, and manage emails + templates |
| `ai.ts` | Generate deal insights, email drafts, company summaries (rate-limited) |
| `search.ts` | Global search across companies, contacts, and deals |
| `import-export.ts` | CSV import/export for companies, contacts, deals |
| `notifications.ts` | In-app notification management |
| `settings.ts` | User preferences and API key management |

---

## AI Features

AI features are optional and require an `ANTHROPIC_API_KEY` environment variable. When the key is not set, AI buttons are gracefully disabled.

| Feature | Action | Description |
|---------|--------|-------------|
| Deal Insights | `generateDealInsights(dealId)` | Analyses deal data, recent activities, and context to produce a risk assessment (low/medium/high), summary, suggested next steps, and win probability assessment |
| Email Drafting | `generateEmailDraft(contactId, context?)` | Composes a professional email based on contact profile, company info, and recent interactions |
| Company Summary | `summarizeCompany(companyId)` | Evaluates relationship health (healthy/at-risk/needs-attention/new) with key metrics and suggested actions |

All AI actions enforce:
- **Authentication** -- Only the record owner can request AI analysis
- **Rate limiting** -- 10 requests per minute per user (configurable store)
- **Input sanitisation** -- All user-generated text is sanitised before inclusion in prompts (control character removal, length truncation)
- **Injection protection** -- System prompt instructs the model to treat all CRM data as untrusted

---

## Import / Export

The CRM supports CSV import and export for three entity types: **Companies**, **Contacts**, and **Deals**.

### Export
Each export action produces a CSV string with a header row. Trigger exports from the respective list page using the export button.

### Import
Upload a CSV file through the import dialog on any list page. The importer:
- Parses headers flexibly (e.g., `First Name`, `firstname`, `first_name` all work)
- Validates enum values (industry, status, stage, etc.) with case-insensitive matching against both keys and labels
- Matches companies and contacts by name when importing deals
- Runs all inserts in a single database transaction (all-or-nothing)
- Returns per-row error details for any validation failures

---

## Design System

Uses the **@vivancedata/ui** component library (installed from GitHub: `github:Vivancedata/ui`) with:

- **Neumorphic shadows** -- `shadow-neu`, `shadow-neu-sm`, `shadow-neu-lg`, `shadow-neu-inset`
- **Glass effects** -- Frosted glass card backgrounds
- **Teal/green primary palette** -- CSS custom properties via `hsl(var(--...))` theming
- **Dark mode support** -- Full dark mode via Tailwind's class strategy
- **Radix UI primitives** -- Dialog, Dropdown Menu, Select, Popover, Tabs, Tooltip, Toast
- **Path alias** -- `@/*` maps to `./src/*` (configured in `tsconfig.json`)

The Tailwind content path includes `../ui/src/**/*.{ts,tsx}` to pick up styles from the external `@vivancedata/ui` package.

---

## Deployment

### Vercel (Recommended)

The project is configured for Vercel deployment with the following settings in `vercel.json`:

```json
{
  "installCommand": "npm install --legacy-peer-deps",
  "buildCommand": "next build"
}
```

**Steps:**

1. Push the repository to GitHub
2. Import the project into Vercel ([vercel.com/new](https://vercel.com/new))
3. Add all required environment variables (`DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
4. Deploy

**Notes:**
- `--legacy-peer-deps` is required because `@vivancedata/ui` is installed from GitHub and may have peer dependency version mismatches
- The `postinstall` script automatically runs `prisma generate` during the Vercel build
- Run `npm run db:deploy` in your CI pipeline or as a Vercel build hook to apply pending migrations

### Database (Railway, Neon, Supabase, etc.)

1. Create a PostgreSQL instance on your provider of choice
2. Copy the connection string to the `DATABASE_URL` environment variable
3. Run migrations: `npm run db:deploy`

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and ensure they pass linting: `npm run lint`
4. Commit with a descriptive message
5. Push to your fork and open a pull request

### Development Guidelines

- **Server Components by default** -- Only use `"use client"` when you need interactivity (forms, state, effects)
- **Server Actions for mutations** -- Never create API routes; use `src/lib/actions/` instead
- **Zod validation** -- Every action must validate input with a schema from `src/lib/validations/`
- **Scoped data access** -- All queries must filter by the authenticated user (`createdById`, `ownerId`, `assigneeId`)
- **No raw SQL** -- Use Prisma for all database operations

---

## License

MIT (c) Vivancedata
