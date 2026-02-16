"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TaskItem {
  id: string;
  title: string;
  dueDate: Date | null;
  priority: string;
}

interface UpcomingTasksProps {
  tasks: TaskItem[];
}

const priorityColors: Record<string, "secondary" | "info" | "warning" | "destructive"> = {
  LOW: "secondary",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "destructive",
};

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {
  return (
    <Card variant="neu">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Tasks</CardTitle>
        <Badge variant="outline">{tasks.length} pending</Badge>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No upcoming tasks.
          </p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex-1 space-y-1">
                  <p className="font-medium leading-none">{task.title}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant={priorityColors[task.priority] ?? "secondary"}
                    className="text-xs"
                  >
                    {task.priority.toLowerCase()}
                  </Badge>
                  {task.dueDate && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
