import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { DealKanban } from "@/components/deals/deal-kanban";
import { CreateDealDialog } from "@/components/deals/create-deal-dialog";
import { ExportButton } from "@/components/shared/export-button";
import { ImportDialog } from "@/components/shared/import-dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Briefcase } from "lucide-react";

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const user = await requireUser();

  const sp = await searchParams;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const pageSize = 25;

  const [deals, totalCount, companies, contacts] = await Promise.all([
    prisma.deal.findMany({
      where: { ownerId: user.id },
      include: { company: true, contact: true },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.deal.count({
      where: { ownerId: user.id },
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

  const totalPages = Math.ceil(totalCount / pageSize);

  const activeDeals = deals.filter(
    (d) => d.stage !== "WON" && d.stage !== "LOST"
  );
  const totalPipeline = activeDeals.reduce(
    (acc, d) => acc + (d.value ? Number(d.value) : 0),
    0
  );

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

      {totalCount === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No deals yet"
          description="Create your first deal to start tracking your pipeline."
          action={<CreateDealDialog companies={companies} contacts={contacts} />}
        />
      ) : (
        <>
          <DealKanban deals={deals} />
          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
