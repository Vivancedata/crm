"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export type NotificationItem = {
  id: string;
  type: "overdue_task" | "deal_closing";
  title: string;
  subtitle: string;
  href: string;
  date: string;
};

export type NotificationsResult = {
  items: NotificationItem[];
  count: number;
};

export async function getNotifications(): Promise<NotificationsResult> {
  const user = await requireUser();
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [overdueTasks, closingDeals] = await Promise.all([
    prisma.task.findMany({
      where: {
        assigneeId: user.id,
        status: { not: "COMPLETED" },
        dueDate: { lt: now },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        priority: true,
        deal: { select: { id: true } },
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
    prisma.deal.findMany({
      where: {
        ownerId: user.id,
        stage: { notIn: ["WON", "LOST"] },
        expectedClose: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      select: {
        id: true,
        title: true,
        expectedClose: true,
        stage: true,
      },
      orderBy: { expectedClose: "asc" },
      take: 10,
    }),
  ]);

  const items: NotificationItem[] = [
    ...overdueTasks.map((task) => ({
      id: task.id,
      type: "overdue_task" as const,
      title: task.title,
      subtitle: `Overdue - ${task.priority.toLowerCase()} priority`,
      href: task.deal ? `/deals/${task.deal.id}` : "/tasks",
      date: task.dueDate?.toISOString() ?? "",
    })),
    ...closingDeals.map((deal) => ({
      id: deal.id,
      type: "deal_closing" as const,
      title: deal.title,
      subtitle: `Closing soon - ${deal.stage.toLowerCase()}`,
      href: `/deals/${deal.id}`,
      date: deal.expectedClose?.toISOString() ?? "",
    })),
  ];

  return {
    items,
    count: items.length,
  };
}
