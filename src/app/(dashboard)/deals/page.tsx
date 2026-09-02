import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { EmptyState } from "@/components/shared/empty-state";
import { DealKanban } from "@/components/deals/deal-kanban";
import { ClosedDeals } from "@/components/deals/closed-deals";
import { CreateDealDialog } from "@/components/deals/create-deal-dialog";
import { ExportButton } from "@/components/shared/export-button";
import { ImportDialog } from "@/components/shared/import-dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { isActiveStage, type BoardDeal, type DealStage } from "@/lib/deal-board";
import { Briefcase } from "lucide-react";

export default async function DealsPage() {
  const user = await requireUser();

  // The board is the page. It used to read a 25-row `take`/`skip` slice with a
  // Pagination control underneath it, so the columns, their totals and the
  // header badge all described page 1 rather than the pipeline -- and page 2
  // was a second, equally partial board. A pipeline has to be shown whole to
  // mean anything, and this is a one-person practice's deal list.
  const [deals, companies, contacts] = await Promise.all([
    prisma.deal.findMany({
      where: { ownerId: user.id },
      select: {
        id: true,
        title: true,
        stage: true,
        value: true,
        createdAt: true,
        expectedClose: true,
        actualClose: true,
        lostReason: true,
        company: { select: { name: true } },
        contact: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
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

  const dealIds = deals.map((d) => d.id);

  // Two aggregates rather than one activity row per deal: when the deal last
  // moved (its age in the current stage) and when anything last happened to it.
  const [lastMove, lastTouch] = await Promise.all([
    prisma.activity.groupBy({
      by: ["dealId"],
      where: { userId: user.id, dealId: { in: dealIds }, type: "DEAL_STAGE_CHANGE" },
      _max: { occurredAt: true },
    }),
    prisma.activity.groupBy({
      by: ["dealId"],
      where: { userId: user.id, dealId: { in: dealIds } },
      _max: { occurredAt: true },
    }),
  ]);

  const movedAt = new Map(lastMove.map((r) => [r.dealId, r._max.occurredAt]));
  const touchedAt = new Map(lastTouch.map((r) => [r.dealId, r._max.occurredAt]));

  const boardDeals: BoardDeal[] = deals.map((d) => ({
    id: d.id,
    title: d.title,
    stage: d.stage as DealStage,
    value: d.value === null ? null : Number(d.value),
    companyName: d.company?.name ?? null,
    contactName: d.contact ? `${d.contact.firstName} ${d.contact.lastName}` : null,
    expectedClose: d.expectedClose?.toISOString() ?? null,
    stageSince: (movedAt.get(d.id) ?? d.createdAt).toISOString(),
    lastActivityAt: touchedAt.get(d.id)?.toISOString() ?? null,
  }));

  const activeDeals = boardDeals.filter((d) => isActiveStage(d.stage));
  const totalPipeline = activeDeals.reduce((acc, d) => acc + (d.value ?? 0), 0);

  const closedDeals = deals
    .filter((d) => !isActiveStage(d.stage))
    .map((d) => ({
      id: d.id,
      title: d.title,
      stage: d.stage as "WON" | "LOST",
      value: d.value === null ? null : Number(d.value),
      companyName: d.company?.name ?? null,
      closedAt: (d.actualClose ?? d.createdAt).toISOString(),
      lostReason: d.lostReason,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 font-bold">Deals</h1>
          <div className="mt-1 flex items-center gap-3">
            <p className="text-muted-foreground">
              Track and manage your sales pipeline
            </p>
            <Badge variant="outline">
              {activeDeals.length} active &middot;{" "}
              {formatCurrency(totalPipeline)} pipeline
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ImportDialog entityType="deals" />
          <ExportButton entityType="deals" />
          <CreateDealDialog companies={companies} contacts={contacts} />
        </div>
      </div>

      {deals.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No deals yet"
          description="Create your first deal to start tracking your pipeline."
          action={<CreateDealDialog companies={companies} contacts={contacts} />}
        />
      ) : (
        <>
          <DealKanban deals={activeDeals} />
          <ClosedDeals deals={closedDeals} />
        </>
      )}
    </div>
  );
}
