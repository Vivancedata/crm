import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { ReportsContent } from "@/components/reports/reports-content";
import {
  DEAL_STAGE_LABELS,
  SERVICE_TYPE_LABELS,
  LEAD_SOURCE_LABELS,
} from "@/lib/constants";

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  CALL: "Call",
  EMAIL: "Email",
  MEETING: "Meeting",
  NOTE: "Note",
  TASK_COMPLETED: "Task Completed",
  DEAL_STAGE_CHANGE: "Stage Change",
  PROPOSAL_SENT: "Proposal Sent",
  CONTRACT_SIGNED: "Contract Signed",
};

export default async function ReportsPage() {
  const user = await requireUser();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [deals, activities, contacts] = await Promise.all([
    prisma.deal.findMany({
      where: { ownerId: user.id },
      select: {
        id: true,
        stage: true,
        value: true,
        serviceType: true,
        createdAt: true,
        actualClose: true,
      },
    }),
    prisma.activity.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        type: true,
        occurredAt: true,
      },
    }),
    prisma.contact.findMany({
      where: { createdById: user.id },
      select: {
        id: true,
        source: true,
        createdAt: true,
      },
    }),
  ]);

  // ---- Pipeline data ----
  const pipelineStages = ["LEAD", "QUALIFIED", "DISCOVERY", "PROPOSAL", "NEGOTIATION"] as const;
  const pipelineData = pipelineStages.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage);
    return {
      name: DEAL_STAGE_LABELS[stage] || stage,
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce((acc, d) => acc + (d.value ? Number(d.value) : 0), 0),
    };
  });

  // ---- Activity data ----
  const activityByType: Record<string, number> = {};
  activities.forEach((a) => {
    const label = ACTIVITY_TYPE_LABELS[a.type] || a.type;
    activityByType[label] = (activityByType[label] || 0) + 1;
  });
  const activityByTypeData = Object.entries(activityByType).map(([name, value]) => ({
    name,
    value,
  }));

  // Activities by day (last 30 days)
  const dayMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    dayMap[key] = 0;
  }
  activities
    .filter((a) => new Date(a.occurredAt) >= thirtyDaysAgo)
    .forEach((a) => {
      const key = new Date(a.occurredAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (key in dayMap) {
        dayMap[key]++;
      }
    });
  const activityByDayData = Object.entries(dayMap).map(([date, count]) => ({
    date,
    count,
  }));

  // ---- Lead source data ----
  const sourceMap: Record<string, number> = {};
  contacts.forEach((c) => {
    if (c.source) {
      const label = LEAD_SOURCE_LABELS[c.source] || c.source;
      sourceMap[label] = (sourceMap[label] || 0) + 1;
    }
  });
  const leadBySourceData = Object.entries(sourceMap).map(([name, value]) => ({
    name,
    value,
  }));

  // Contacts created by week (last 12 weeks)
  const weekMap: Record<string, number> = {};
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const key = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    weekMap[key] = 0;
  }
  contacts
    .filter((c) => new Date(c.createdAt) >= twelveWeeksAgo)
    .forEach((c) => {
      const created = new Date(c.createdAt);
      // Find the closest week bucket
      let bestKey = "";
      let bestDiff = Infinity;
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const diff = created.getTime() - weekStart.getTime();
        if (diff >= 0 && diff < 7 * 24 * 60 * 60 * 1000 && diff < bestDiff) {
          bestDiff = diff;
          bestKey = weekStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        }
      }
      if (bestKey && bestKey in weekMap) {
        weekMap[bestKey]++;
      }
    });
  const leadByWeekData = Object.entries(weekMap).map(([week, count]) => ({
    week,
    count,
  }));

  // ---- Revenue data ----
  const wonDeals = deals.filter((d) => d.stage === "WON");
  const lostDeals = deals.filter((d) => d.stage === "LOST");
  const closedDeals = wonDeals.length + lostDeals.length;

  const totalWonValue = wonDeals.reduce(
    (acc, d) => acc + (d.value ? Number(d.value) : 0),
    0
  );
  const avgDealSize = wonDeals.length > 0 ? totalWonValue / wonDeals.length : 0;
  const winRate =
    closedDeals > 0 ? Math.round((wonDeals.length / closedDeals) * 100) : 0;

  // Revenue by service type (all deals with value)
  const serviceMap: Record<string, number> = {};
  deals
    .filter((d) => d.value && Number(d.value) > 0)
    .forEach((d) => {
      const label = SERVICE_TYPE_LABELS[d.serviceType] || d.serviceType;
      serviceMap[label] = (serviceMap[label] || 0) + Number(d.value);
    });
  const revenueByServiceData = Object.entries(serviceMap).map(([name, value]) => ({
    name,
    value,
  }));

  // Won revenue by month (last 6 months)
  const monthMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    monthMap[key] = 0;
  }
  wonDeals
    .filter((d) => d.actualClose && new Date(d.actualClose) >= sixMonthsAgo)
    .forEach((d) => {
      if (d.actualClose) {
        const closeDate = new Date(d.actualClose);
        const key = closeDate.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        if (key in monthMap) {
          monthMap[key] += d.value ? Number(d.value) : 0;
        }
      }
    });
  const revenueByMonthData = Object.entries(monthMap).map(([month, value]) => ({
    month,
    value,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Analytics and insights for your pipeline."
      />

      <ReportsContent
        pipelineData={pipelineData}
        activityByType={activityByTypeData}
        activityByDay={activityByDayData}
        leadBySource={leadBySourceData}
        leadByWeek={leadByWeekData}
        totalWonValue={totalWonValue}
        avgDealSize={avgDealSize}
        winRate={winRate}
        revenueByService={revenueByServiceData}
        revenueByMonth={revenueByMonthData}
      />
    </div>
  );
}
