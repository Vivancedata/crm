import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteDealDialog } from "@/components/deals/delete-deal-dialog";
import { EditDealDialog } from "@/components/deals/edit-deal-dialog";
import { NoteList } from "@/components/notes/note-list";
import { ActivityTimeline } from "@/components/activities/activity-timeline";
import { DealInsights } from "@/components/ai/deal-insights";
import {
  DEAL_STAGE_LABELS,
  SERVICE_TYPE_LABELS,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  User,
  DollarSign,
  Calendar,
  Target,
  Layers,
} from "lucide-react";

interface DealDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DealDetailPage({ params }: DealDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;

  const [deal, companies, contacts] = await Promise.all([
    prisma.deal.findFirst({
      where: { id, ownerId: user.id },
      include: {
        company: true,
        contact: true,
        owner: true,
        notes: {
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
    prisma.contact.findMany({
      where: { createdById: user.id },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  if (!deal) notFound();

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link
          href="/deals"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Deals
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-heading-2 font-bold">{deal.title}</h1>
            <div className="mt-1 flex items-center gap-3">
              <Badge variant={deal.stage.toLowerCase() as BadgeProps["variant"]}>
                {DEAL_STAGE_LABELS[deal.stage]}
              </Badge>
              <Badge variant="outline">
                {SERVICE_TYPE_LABELS[deal.serviceType]}
              </Badge>
              {deal.value && (
                <span className="text-lg font-semibold text-primary">
                  {formatCurrency(Number(deal.value))}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <EditDealDialog
              deal={deal}
              companies={companies}
              contacts={contacts}
            />
            <DeleteDealDialog
              dealId={deal.id}
              dealTitle={deal.title}
              redirectOnDelete
            />
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Value</p>
              <p className="font-semibold">
                {deal.value ? formatCurrency(Number(deal.value)) : "Not set"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Target className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Win Probability</p>
              <p className="font-semibold">{deal.probability}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Expected Close</p>
              <p className="font-semibold">
                {deal.expectedClose ? formatDate(deal.expectedClose) : "Not set"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Layers className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Service</p>
              <p className="font-semibold">
                {SERVICE_TYPE_LABELS[deal.serviceType]}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {deal.company && (
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <Link
                      href={`/companies/${deal.company.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {deal.company.name}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
            {deal.contact && (
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <Link
                      href={`/contacts/${deal.contact.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {deal.contact.firstName} {deal.contact.lastName}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {deal.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {deal.description}
                </p>
              </CardContent>
            </Card>
          )}
          {deal.lostReason && (
            <Card>
              <CardHeader>
                <CardTitle>Lost Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-destructive">{deal.lostReason}</p>
              </CardContent>
            </Card>
          )}
          <DealInsights dealId={deal.id} />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTimeline
            activities={deal.activities}
            currentUserId={user.id}
            dealId={deal.id}
          />
        </TabsContent>

        <TabsContent value="notes">
          <NoteList
            notes={deal.notes}
            entityType="deal"
            entityId={deal.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
