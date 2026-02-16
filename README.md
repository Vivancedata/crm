# Vivancedata CRM

A modern CRM built for AI consulting businesses, specifically designed to serve startups and blue-collar industries (construction, HVAC, manufacturing, logistics, etc.).

## Features

### Core CRM
- **Contact Management** — Track people, their companies, and relationships
- **Company Profiles** — Industry tagging, size, location, and notes
- **Deal Pipeline** — Kanban-style pipeline (Lead → Qualified → Discovery → Proposal → Negotiation → Won/Lost)
- **Activity Timeline** — Log calls, emails, meetings, and notes
- **Task Management** — Follow-up reminders with priority levels

### Consulting-Specific
- **Project Tracking** — Manage active engagements after deals close
- **Service Types** — Consulting, Integration, Training, Support, Custom
- **Industry Tags** — Construction, Manufacturing, HVAC, Logistics, Startup, etc.
- **Time Tracking** — Log hours for billing (coming soon)

### Communication
- **Email Templates** — Reusable templates for outreach
- **Email Sending** — Send emails via Resend (deliverability depends on your domain setup)
- **Activity Logging** — Log communications and follow-ups

### Analytics
- **Pipeline Dashboard** — Total value, deal counts by stage
- **Conversion Metrics** — Win rate, average deal size
- **Activity Reports** — Team productivity tracking

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS + Vivancedata UI |
| Database | PostgreSQL + Prisma ORM |
| Auth | Clerk |
| Email | Resend |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account (for auth)
- Resend account (for emails, optional)

### Installation

```bash
# Clone the repo
git clone https://github.com/Vivancedata/crm.git
cd crm

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Apply database migrations
npm run db:migrate
# (For quick prototyping only: npm run db:push)

# Seed with sample data (optional)
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Resend (optional)
RESEND_API_KEY="re_..."
EMAIL_FROM="CRM <noreply@vivancedata.com>"

# Anthropic (optional)
ANTHROPIC_API_KEY="sk-ant-..."

# Logging
LOG_LEVEL="info"

# Rate limiting store (memory|db). Default: db in production, memory in dev.
RATE_LIMIT_STORE="db"
```

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/       # Dashboard layout & pages
│   │   ├── page.tsx       # Main dashboard
│   │   ├── contacts/      # Contacts list & detail
│   │   ├── companies/     # Companies list & detail
│   │   ├── deals/         # Pipeline & deal management
│   │   ├── projects/      # Active projects
│   │   ├── tasks/         # Task management
│   │   ├── emails/        # Email templates & history
│   │   └── reports/       # Analytics & reports
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Base UI components
│   ├── layout/            # Layout components
│   └── dashboard/         # Dashboard-specific components
├── lib/
│   ├── prisma.ts          # Prisma client
│   ├── actions/           # Server Actions (all mutations)
│   └── utils.ts           # Utility functions
```

## Design System

Uses the **@vivancedata/ui** component library with:
- Neumorphic shadows
- Glass effects
- Teal/green primary palette
- Dark mode support

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Railway (Database)

1. Create PostgreSQL instance
2. Copy connection string to `DATABASE_URL`

## License

MIT © Vivancedata
