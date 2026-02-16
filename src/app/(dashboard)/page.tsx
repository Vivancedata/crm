import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { DashboardStats } from "@/components/dashboard/stats";
import { PipelineOverview } from "@/components/dashboard/pipeline-overview";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";

export default async function DashboardPage() {
  const user = await requireUser();

  const [deals, newContactsThisWeek, activities, tasks] = await Promise.all([
    prisma.deal.findMany({
      where: { ownerId: user.id },
      select: { stage: true, value: true },
    }),
    prisma.contact.count({
      where: {
        createdById: user.id,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.activity.findMany({
      where: { userId: user.id },
      orderBy: { occurredAt: "desc" },
      take: 5,
      select: { id: true, type: true, subject: true, occurredAt: true },
    }),
    prisma.task.findMany({
      where: {
        assigneeId: user.id,
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
      select: { id: true, title: true, dueDate: true, priority: true },
    }),
  ]);

  // Calculate stats
  const activeDeals = deals.filter(
    (d) => d.stage !== "WON" && d.stage !== "LOST"
  );
  const pipelineValue = activeDeals.reduce(
    (acc, d) => acc + (d.value ? Number(d.value) : 0),
    0
  );
  const wonDeals = deals.filter((d) => d.stage === "WON").length;
  const closedDeals = deals.filter(
    (d) => d.stage === "WON" || d.stage === "LOST"
  ).length;
  const winRate = closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 0;

  // Pipeline stages
  const stageConfig = [
    { key: "LEAD", name: "Lead", variant: "lead" as const },
    { key: "QUALIFIED", name: "Qualified", variant: "qualified" as const },
    { key: "DISCOVERY", name: "Discovery", variant: "discovery" as const },
    { key: "PROPOSAL", name: "Proposal", variant: "proposal" as const },
    { key: "NEGOTIATION", name: "Negotiation", variant: "negotiation" as const },
  ];

  const pipelineStages = stageConfig.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage.key);
    return {
      name: stage.name,
      variant: stage.variant,
      count: stageDeals.length,
      value: stageDeals.reduce(
        (acc, d) => acc + (d.value ? Number(d.value) : 0),
        0
      ),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-2 font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here&apos;s what&apos;s happening with your pipeline.
        </p>
      </div>

      <DashboardStats
        pipelineValue={pipelineValue}
        activeDeals={activeDeals.length}
        newContactsThisWeek={newContactsThisWeek}
        winRate={winRate}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <PipelineOverview stages={pipelineStages} />
        <UpcomingTasks tasks={tasks} />
      </div>

      <RecentActivity activities={activities} />
    </div>
  );
}
