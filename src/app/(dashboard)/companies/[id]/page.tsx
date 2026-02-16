import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditCompanyDialog } from "@/components/companies/edit-company-dialog";
import { DeleteCompanyDialog } from "@/components/companies/delete-company-dialog";
import { NoteList } from "@/components/notes/note-list";
import { ActivityTimeline } from "@/components/activities/activity-timeline";
import { INDUSTRY_LABELS, COMPANY_SIZE_LABELS, DEAL_STAGE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { ArrowLeft, Globe, Phone, MapPin, Users, Briefcase } from "lucide-react";

interface CompanyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;

  const company = await prisma.company.findFirst({
    where: { id, createdById: user.id },
    include: {
      contacts: { orderBy: { createdAt: "desc" } },
      deals: { orderBy: { createdAt: "desc" } },
      notes: { orderBy: { createdAt: "desc" }, include: { author: true } },
      activities: {
        orderBy: { occurredAt: "desc" },
        take: 20,
        include: { user: true },
      },
      _count: { select: { contacts: true, deals: true } },
    },
  });

  if (!company) notFound();

  return (
    <div className="space-y-6">
      {/* Back button + header */}
      <div>
        <Link
          href="/companies"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Companies
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl font-bold">
              {getInitials(company.name)}
            </div>
            <div>
              <h1 className="text-heading-2 font-bold">{company.name}</h1>
              <div className="mt-1 flex items-center gap-3">
                <Badge variant="outline">
                  {INDUSTRY_LABELS[company.industry]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {COMPANY_SIZE_LABELS[company.size]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <EditCompanyDialog company={company} />
            <DeleteCompanyDialog
              companyId={company.id}
              companyName={company.name}
              redirectOnDelete
            />
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {company.website && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {company.website}
              </a>
            </CardContent>
          </Card>
        )}
        {company.phone && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{company.phone}</span>
            </CardContent>
          </Card>
        )}
        {(company.city || company.state) && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">
                {[company.address, company.city, company.state, company.zipCode]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">
            Contacts ({company._count.contacts})
          </TabsTrigger>
          <TabsTrigger value="deals">
            Deals ({company._count.deals})
          </TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card variant="neu">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{company._count.contacts}</p>
                  <p className="text-sm text-muted-foreground">Contacts</p>
                </div>
              </CardContent>
            </Card>
            <Card variant="neu">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{company._count.deals}</p>
                  <p className="text-sm text-muted-foreground">Deals</p>
                </div>
              </CardContent>
            </Card>
          </div>
          {company.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{company.description}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contacts">
          {company.contacts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No contacts linked to this company yet.
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border bg-card">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {company.contacts.map((contact) => (
                    <tr key={contact.id} className="border-b last:border-0 hover:bg-accent/50">
                      <td className="px-6 py-4">
                        <Link href={`/contacts/${contact.id}`} className="font-medium hover:underline">
                          {contact.firstName} {contact.lastName}
                          {contact.isPrimary && (
                            <Badge variant="secondary" className="ml-2">Primary</Badge>
                          )}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{contact.email ?? "-"}</td>
                      <td className="px-6 py-4 text-muted-foreground">{contact.title ?? "-"}</td>
                      <td className="px-6 py-4">
                        <Badge variant={contact.status === "ACTIVE" ? "success" : "secondary"}>
                          {contact.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="deals">
          {company.deals.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No deals linked to this company yet.
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
	                  {company.deals.map((deal) => (
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
            notes={company.notes}
            entityType="company"
            entityId={company.id}
          />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTimeline
            activities={company.activities}
            currentUserId={user.id}
            companyId={company.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
