import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { ContactTable } from "@/components/contacts/contact-table";
import { CreateContactDialog } from "@/components/contacts/create-contact-dialog";
import { ExportButton } from "@/components/shared/export-button";
import { ImportDialog } from "@/components/shared/import-dialog";
import { Users } from "lucide-react";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const user = await requireUser();

  const sp = await searchParams;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const pageSize = 25;

  const [contacts, totalCount, companies] = await Promise.all([
    prisma.contact.findMany({
      where: { createdById: user.id },
      include: { company: true },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.contact.count({
      where: { createdById: user.id },
    }),
    prisma.company.findMany({
      where: { createdById: user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="Manage your contacts and leads"
        action={
          <div className="flex items-center gap-2">
            <ImportDialog entityType="contacts" />
            <ExportButton entityType="contacts" />
            <CreateContactDialog companies={companies} />
          </div>
        }
      />

      {totalCount === 0 ? (
        <EmptyState
          icon={Users}
          title="No contacts yet"
          description="Add your first contact to start tracking your leads."
          action={<CreateContactDialog companies={companies} />}
        />
      ) : (
        <>
          <ContactTable contacts={contacts} />
          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
