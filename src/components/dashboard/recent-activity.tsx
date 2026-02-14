"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeDate, getInitials } from "@/lib/utils";
import { 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const activities = [
  {
    id: 1,
    type: "call",
    subject: "Discovery call with Martinez Construction",
    contact: "Carlos Martinez",
    company: "Martinez Construction",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
  },
  {
    id: 2,
    type: "email",
    subject: "Sent AI integration proposal",
    contact: "Sarah Johnson",
    company: "Green Valley HVAC",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: 3,
    type: "deal_stage",
    subject: "Deal moved to Proposal",
    contact: "Mike Chen",
    company: "TechStart Inc",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
  },
  {
    id: 4,
    type: "meeting",
    subject: "AI workflow demo completed",
    contact: "David Smith",
    company: "Smith Logistics",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: 5,
    type: "task",
    subject: "Completed contract review",
    contact: "Jennifer Lee",
    company: "Precision Manufacturing",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26), // 26 hours ago
  },
];

const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  deal_stage: ArrowRight,
  task: CheckCircle2,
  note: FileText,
};

const activityColors = {
  call: "bg-blue-500/10 text-blue-500",
  email: "bg-purple-500/10 text-purple-500",
  meeting: "bg-green-500/10 text-green-500",
  deal_stage: "bg-amber-500/10 text-amber-500",
  task: "bg-emerald-500/10 text-emerald-500",
  note: "bg-gray-500/10 text-gray-500",
};

export function RecentActivity() {
  return (
    <Card variant="neu">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type as keyof typeof activityIcons];
            const colorClass = activityColors[activity.type as keyof typeof activityColors];

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg p-2 transition-colors hover:bg-accent/50"
              >
                <div className={`rounded-lg p-2 ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium leading-none">{activity.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.contact} · {activity.company}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeDate(activity.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
