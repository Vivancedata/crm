"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Popover from "@radix-ui/react-popover";
import { Bell, CheckSquare, Briefcase, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  type NotificationsResult,
} from "@/lib/actions/notifications";
import { formatRelativeDate } from "@/lib/utils";

export function NotificationsPopover() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationsResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getNotifications();
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch notifications when popover opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="relative rounded-lg p-2 hover:bg-accent transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {data && data.count > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {data.count > 9 ? "9+" : data.count}
            </span>
          )}
          {!data && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-50 w-80 rounded-lg border bg-popover p-0 text-popover-foreground shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {data && data.count > 0 && (
              <span className="text-xs text-muted-foreground">
                {data.count} item{data.count !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            )}

            {!loading && (!data || data.items.length === 0) && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            )}

            {!loading &&
              data &&
              data.items.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => navigate(item.href)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-accent transition-colors"
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      item.type === "overdue_task"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning/10 text-warning"
                    )}
                  >
                    {item.type === "overdue_task" ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Briefcase className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.subtitle}
                    </p>
                    {item.date && (
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeDate(item.date)}
                      </p>
                    )}
                  </div>
                  {item.type === "overdue_task" && (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  )}
                </button>
              ))}
          </div>

          {/* Footer */}
          {data && data.count > 0 && (
            <div className="border-t px-4 py-2">
              <button
                onClick={() => navigate("/tasks")}
                className="text-xs font-medium text-primary hover:underline"
              >
                View all tasks
              </button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
