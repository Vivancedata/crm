import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { CompanyTable } from "@/components/companies/company-table";
import { CreateCompanyDialog } from "@/components/companies/create-company-dialog";
import { ExportButton } from "@/components/shared/export-button";
import { ImportDialog } from "@/components/shared/import-dialog";
import { Building2 } from "lucide-react";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const user = await requireUser();

  const sp = await searchParams;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const pageSize = 25;

  const [companies, totalCount] = await Promise.all([
    prisma.company.findMany({
      where: { createdById: user.id },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.company.count({
      where: { createdById: user.id },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies"
        description="Manage your client companies"
        action={
          <div className="flex items-center gap-2">
            <ImportDialog entityType="companies" />
            <ExportButton entityType="companies" />
            <CreateCompanyDialog />
          </div>
        }
      />

      {totalCount === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Add your first company to start building your client base."
          action={<CreateCompanyDialog />}
        />
      ) : (
        <>
          <CompanyTable companies={companies} />
          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
