import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditContactDialog } from "@/components/contacts/edit-contact-dialog";
import { DeleteContactDialog } from "@/components/contacts/delete-contact-dialog";
import { NoteList } from "@/components/notes/note-list";
import { ActivityTimeline } from "@/components/activities/activity-timeline";
import {
  CONTACT_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  DEAL_STAGE_LABELS,
  INDUSTRY_LABELS,
} from "@/lib/constants";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Linkedin,
} from "lucide-react";

interface ContactDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;

  const [contact, companies] = await Promise.all([
    prisma.contact.findFirst({
      where: { id, createdById: user.id },
      include: {
        company: true,
        deals: { orderBy: { createdAt: "desc" } },
        contactNotes: {
          orderBy: { createdAt: "desc" },
          include: { author: true },
        },
        activities: {
          orderBy: { occurredAt: "desc" },
          take: 20,
          include: { user: true },
        },
      },
    }),
    prisma.company.findMany({
      where: { createdById: user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!contact) notFound();

  const statusVariant =
    contact.status === "ACTIVE"
      ? "success"
      : contact.status === "CHURNED"
        ? "destructive"
        : "secondary";

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link
          href="/contacts"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contacts
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl font-bold">
              {getInitials(`${contact.firstName} ${contact.lastName}`)}
            </div>
            <div>
              <h1 className="text-heading-2 font-bold">
                {contact.firstName} {contact.lastName}
              </h1>
              <div className="mt-1 flex items-center gap-3">
                <Badge variant={statusVariant}>
                  {CONTACT_STATUS_LABELS[contact.status]}
                </Badge>
                {contact.title && (
                  <span className="text-sm text-muted-foreground">
                    {contact.title}
                  </span>
                )}
                {contact.source && (
                  <Badge variant="outline">
                    {LEAD_SOURCE_LABELS[contact.source]}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <EditContactDialog contact={contact} companies={companies} />
            <DeleteContactDialog
              contactId={contact.id}
              contactName={`${contact.firstName} ${contact.lastName}`}
              redirectOnDelete
            />
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {contact.email && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <a
                href={`mailto:${contact.email}`}
                className="text-sm text-primary hover:underline truncate"
              >
                {contact.email}
              </a>
            </CardContent>
          </Card>
        )}
        {contact.phone && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{contact.phone}</span>
            </CardContent>
          </Card>
        )}
        {contact.company && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <Link
                href={`/companies/${contact.company.id}`}
                className="text-sm text-primary hover:underline"
              >
                {contact.company.name}
              </Link>
            </CardContent>
          </Card>
        )}
        {contact.linkedin && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Linkedin className="h-5 w-5 text-muted-foreground" />
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                LinkedIn
              </a>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deals">
            Deals ({contact.deals.length})
          </TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card variant="neu">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{contact.deals.length}</p>
                  <p className="text-sm text-muted-foreground">Deals</p>
                </div>
              </CardContent>
            </Card>
            {contact.company && (
              <Card variant="neu">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">{contact.company.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {INDUSTRY_LABELS[contact.company.industry]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {contact.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {contact.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deals">
          {contact.deals.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No deals linked to this contact yet.
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border bg-card">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Deal</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Stage</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Value</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Created</th>
                  </tr>
                </thead>
                <tbody>
	                  {contact.deals.map((deal) => (
	                    <tr key={deal.id} className="border-b last:border-0 hover:bg-accent/50">
                      <td className="px-6 py-4">
                        <Link href={`/deals/${deal.id}`} className="font-medium hover:underline">
                          {deal.title}
                        </Link>
	                      </td>
	                      <td className="px-6 py-4">
	                        <Badge variant={deal.stage.toLowerCase() as BadgeProps["variant"]}>
	                          {DEAL_STAGE_LABELS[deal.stage]}
	                        </Badge>
	                      </td>
                      <td className="px-6 py-4">
                        {deal.value ? formatCurrency(Number(deal.value)) : "-"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(deal.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes">
          <NoteList
            notes={contact.contactNotes}
            entityType="contact"
            entityId={contact.id}
          />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTimeline
            activities={contact.activities}
            currentUserId={user.id}
            contactId={contact.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
