"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Clock } from "lucide-react";
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
import { activityStyle } from "@/lib/activity-style";
import { LogActivityDialog } from "./log-activity-dialog";

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
            const { icon: Icon, chip } = activityStyle(activity.type);
            const isOwner = activity.userId === currentUserId;

            return (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-sm p-2 ${chip}`}>
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{activity.subject}</p>
                            <Badge variant="outline">
                              {activityStyle(activity.type).label}
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
