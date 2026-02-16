import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { ComposeEmailDialog } from "@/components/emails/compose-email-dialog";
import { EmailTable } from "@/components/emails/email-table";
import { TemplateManager } from "@/components/emails/template-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail } from "lucide-react";

export default async function EmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const user = await requireUser();

  const sp = await searchParams;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const pageSize = 25;

  const [emails, totalCount, templates, contacts] = await Promise.all([
    prisma.email.findMany({
      where: { senderId: user.id },
      include: { contact: true },
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.email.count({
      where: { senderId: user.id },
    }),
    prisma.emailTemplate.findMany({
      where: { createdById: user.id },
      orderBy: { name: "asc" },
    }),
    prisma.contact.findMany({
      where: { createdById: user.id },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emails"
        description="Send and manage emails to your contacts"
        action={<ComposeEmailDialog contacts={contacts} templates={templates} />}
      />

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          {totalCount === 0 ? (
            <EmptyState
              icon={Mail}
              title="No emails yet"
              description="Compose your first email to start reaching out to contacts."
              action={<ComposeEmailDialog contacts={contacts} templates={templates} />}
            />
          ) : (
            <>
              <EmailTable emails={emails} />
              <Pagination currentPage={page} totalPages={totalPages} />
            </>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <TemplateManager templates={templates} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
