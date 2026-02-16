"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle2,
  ArrowRight,
  Send,
  FileSignature,
  Trash2,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { deleteActivity } from "@/lib/actions/activities";
import { formatRelativeDate } from "@/lib/utils";
import { LogActivityDialog } from "./log-activity-dialog";

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

interface ActivityUser {
  id: string;
  name: string | null;
  email: string;
}

interface ActivityItem {
  id: string;
  type: string;
  subject: string;
  description: string | null;
  duration: number | null;
  occurredAt: Date;
  userId: string;
  user: ActivityUser;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  currentUserId: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
}

export function ActivityTimeline({
  activities,
  currentUserId,
  contactId,
  companyId,
  dealId,
}: ActivityTimelineProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const result = await deleteActivity(deleteId);
      if (!result.success) {
        toast.error(result.error ?? "Failed to delete activity");
        return;
      }
      toast.success("Activity deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete activity");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <LogActivityDialog
          contactId={contactId}
          companyId={companyId}
          dealId={dealId}
        />
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No activity recorded yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type] ?? FileText;
            const colorClass =
              activityColors[activity.type] ?? "bg-gray-500/10 text-gray-500";
            const isOwner = activity.userId === currentUserId;

            return (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-lg p-2 ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{activity.subject}</p>
                            <Badge variant="outline">
                              {ACTIVITY_TYPE_LABELS[activity.type] ?? activity.type}
                            </Badge>
                          </div>
                          {activity.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span>
                              {activity.user.name ?? activity.user.email}
                            </span>
                            <span>&middot;</span>
                            <span>{formatRelativeDate(activity.occurredAt)}</span>
                            {activity.duration && (
                              <>
                                <span>&middot;</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {activity.duration} min
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(activity.id)}
                            title="Delete activity"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Activity</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this activity? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
