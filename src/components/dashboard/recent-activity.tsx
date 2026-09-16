"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils";
import { activityStyle } from "@/lib/activity-style";

interface ActivityItem {
  id: string;
  type: string;
  subject: string;
  occurredAt: Date;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
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
              const { icon: Icon, chip } = activityStyle(activity.type);

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 rounded-sm p-2 transition-colors hover:bg-accent/50"
                >
                  <div className={`rounded-sm p-2 ${chip}`}>
                    <Icon aria-hidden="true" className="h-4 w-4" />
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
