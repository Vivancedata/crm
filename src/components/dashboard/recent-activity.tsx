"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils";
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  ArrowRight,
  CheckCircle2,
  Send,
  FileSignature,
  type LucideIcon,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  subject: string;
  occurredAt: Date;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const activityIcons: Record<string, LucideIcon> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  NOTE: FileText,
  TASK_COMPLETED: CheckCircle2,
  DEAL_STAGE_CHANGE: ArrowRight,
  PROPOSAL_SENT: Send,
  CONTRACT_SIGNED: FileSignature,
};

const activityColors: Record<string, string> = {
  CALL: "bg-blue-500/10 text-blue-500",
  EMAIL: "bg-purple-500/10 text-purple-500",
  MEETING: "bg-green-500/10 text-green-500",
  NOTE: "bg-gray-500/10 text-gray-500",
  TASK_COMPLETED: "bg-emerald-500/10 text-emerald-500",
  DEAL_STAGE_CHANGE: "bg-amber-500/10 text-amber-500",
  PROPOSAL_SENT: "bg-indigo-500/10 text-indigo-500",
  CONTRACT_SIGNED: "bg-teal-500/10 text-teal-500",
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card variant="neu">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No recent activity.
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type] ?? FileText;
              const colorClass =
                activityColors[activity.type] ?? "bg-gray-500/10 text-gray-500";

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 rounded-lg p-2 transition-colors hover:bg-accent/50"
                >
                  <div className={`rounded-lg p-2 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium leading-none">
                      {activity.subject}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(activity.occurredAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
