import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { TaskListTabs } from "@/components/tasks/task-list-tabs";
import { CheckSquare } from "lucide-react";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const user = await requireUser();

  const sp = await searchParams;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const pageSize = 25;

  const [tasks, totalCount, contacts, deals] = await Promise.all([
    prisma.task.findMany({
      where: { assigneeId: user.id },
      include: {
        contact: { select: { firstName: true, lastName: true } },
        deal: { select: { title: true } },
      },
      orderBy: { dueDate: "asc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.task.count({
      where: { assigneeId: user.id },
    }),
    prisma.contact.findMany({
      where: { createdById: user.id },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.deal.findMany({
      where: { ownerId: user.id },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const contactOptions = contacts.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
  }));

  const dealOptions = deals.map((d) => ({
    id: d.id,
    title: d.title,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Manage your tasks and to-dos"
        action={<CreateTaskDialog contacts={contactOptions} deals={dealOptions} />}
      />

      {totalCount === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="Add your first task to start tracking your work."
          action={<CreateTaskDialog contacts={contactOptions} deals={dealOptions} />}
        />
      ) : (
        <>
          <TaskListTabs
            tasks={tasks}
            contacts={contactOptions}
            deals={dealOptions}
          />
          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
