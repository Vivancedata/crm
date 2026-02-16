# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev          # Start dev server (Next.js on localhost:3000)
bun run build        # Production build
bun run lint         # ESLint
bun run db:push      # Push Prisma schema to DB (no migration history)
bun run db:migrate   # Create and apply Prisma migration
bun run db:studio    # Open Prisma Studio GUI
bun run db:seed      # Seed database (tsx prisma/seed.ts)
```

After changing `prisma/schema.prisma`, run `bun run db:push` (dev) or `bun run db:migrate` (production). Prisma Client is auto-generated via the `postinstall` script.

No test framework is configured.

## Architecture

**Next.js 14 App Router** with a `(dashboard)` route group. All authenticated pages live under `src/app/(dashboard)/` and share a sidebar + header layout. Auth pages are at `src/app/sign-in/` and `src/app/sign-up/`.

**No API routes.** All data mutations use **Next.js Server Actions** in `src/lib/actions/`. Each action file corresponds to a domain (contacts, deals, companies, tasks, etc.). Actions follow this pattern:
1. Call `requireUser()` from `src/lib/auth.ts` to authenticate (upserts Clerk user to DB)
2. Validate input with a Zod schema from `src/lib/validations/`
3. Perform Prisma operations
4. Call `revalidatePath()` to refresh affected pages

**Pages are server components** that fetch data directly via Prisma. Client components receive data as props. See `src/app/(dashboard)/deals/page.tsx` for a typical pattern using `Promise.all` for parallel queries.

### Key Modules

| Path | Purpose |
|------|---------|
| `src/lib/prisma.ts` | Singleton Prisma client (global cache in dev) |
| `src/lib/auth.ts` | `getCurrentUser()` / `requireUser()` — syncs Clerk identity to DB User |
| `src/lib/constants.ts` | Display labels for all Prisma enums (e.g., `DEAL_STAGE_LABELS`) |
| `src/lib/ai.ts` | AI model config (Anthropic via Vercel AI SDK) |
| `src/lib/resend.ts` | Resend email client |
| `src/lib/validations/` | Zod schemas for each entity, one file per domain |
| `src/lib/actions/` | Server actions for each domain |
| `src/components/ui/` | Base UI primitives (Radix-based, shadcn/ui pattern) |
| `src/components/shared/` | Reusable page-level components (PageHeader, EmptyState, etc.) |
| `src/middleware.ts` | Clerk auth middleware — public routes: `/sign-in`, `/sign-up` |

### Data Model

The Prisma schema (`prisma/schema.prisma`) models a CRM pipeline: User → Company → Contact → Deal → Project, with Activity, Task, Email, and Note as cross-cutting entities. All records are scoped to the authenticated user (`createdById`/`ownerId`/`assigneeId`). Deal stages follow: Lead → Qualified → Discovery → Proposal → Negotiation → Won/Lost.

### Design System

Uses `@vivancedata/ui` (GitHub dependency) with a neumorphic design language. Tailwind is configured with CSS custom properties (`hsl(var(--...))`) for theming. Custom shadow utilities: `shadow-neu`, `shadow-neu-sm`, `shadow-neu-lg`, `shadow-neu-inset`. The tailwind content path includes `../ui/src/**/*.{ts,tsx}` for the external package.

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

## Environment Variables

Required: `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
Optional: `RESEND_API_KEY`

See `.env.example` for full list including Clerk redirect URLs.

## Deployment

Vercel with `--legacy-peer-deps` (configured in `vercel.json` and `.npmrc`). The `@vivancedata/ui` package is pulled from GitHub.
