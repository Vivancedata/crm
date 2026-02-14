"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Clock } from "lucide-react";

const tasks = [
  {
    id: 1,
    title: "Follow up with Martinez Construction",
    dueDate: "Today",
    priority: "high",
    contact: "Carlos Martinez",
  },
  {
    id: 2,
    title: "Send proposal to Green Valley HVAC",
    dueDate: "Tomorrow",
    priority: "urgent",
    contact: "Sarah Johnson",
  },
  {
    id: 3,
    title: "Schedule demo for TechStart Inc",
    dueDate: "Feb 16",
    priority: "medium",
    contact: "Mike Chen",
  },
  {
    id: 4,
    title: "Review contract terms with Smith Logistics",
    dueDate: "Feb 17",
    priority: "high",
    contact: "David Smith",
  },
];

const priorityColors = {
  low: "secondary",
  medium: "info",
  high: "warning",
  urgent: "destructive",
} as const;

export function UpcomingTasks() {
  return (
    <Card variant="neu">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Tasks</CardTitle>
        <Badge variant="outline">{tasks.length} pending</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
            >
              <button className="mt-0.5 rounded border-2 border-muted-foreground/30 p-0.5 hover:border-primary">
                <CheckSquare className="h-4 w-4 text-muted-foreground/50" />
              </button>
              <div className="flex-1 space-y-1">
                <p className="font-medium leading-none">{task.title}</p>
                <p className="text-sm text-muted-foreground">{task.contact}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={priorityColors[task.priority]} className="text-xs">
                  {task.priority}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {task.dueDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
