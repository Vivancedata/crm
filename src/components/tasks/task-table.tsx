"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { toggleTaskStatus } from "@/lib/actions/tasks";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog";
import { MoreHorizontal, Pencil, Trash2, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@prisma/client";

type TaskWithRelations = Task & {
  contact: { firstName: string; lastName: string } | null;
  deal: { title: string } | null;
};

interface TaskTableProps {
  tasks: TaskWithRelations[];
  contacts: { id: string; name: string }[];
  deals: { id: string; title: string }[];
}

export function TaskTable({ tasks, contacts, deals }: TaskTableProps) {
  const [editTask, setEditTask] = useState<TaskWithRelations | null>(null);
  const [deleteTask, setDeleteTask] = useState<TaskWithRelations | null>(null);

  async function handleToggleStatus(taskId: string) {
    try {
      const result = await toggleTaskStatus(taskId);
      if (!result.success) {
        toast.error(result.error ?? "Failed to update task status");
        return;
      }
      toast.success("Task status updated");
    } catch {
      toast.error("Failed to update task status");
    }
  }

  const columns: ColumnDef<TaskWithRelations>[] = [
    {
      id: "toggle",
      header: "",
      cell: ({ row }) => {
        const isCompleted = row.original.status === "COMPLETED";
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(row.original.id);
            }}
            className="flex items-center justify-center"
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <span
          className={
            row.original.status === "COMPLETED"
              ? "line-through text-muted-foreground"
              : "font-medium"
          }
        >
          {row.original.title}
        </span>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.original.priority;
        const variant =
          priority === "URGENT"
            ? "destructive"
            : priority === "HIGH"
              ? "warning"
              : priority === "MEDIUM"
                ? "secondary"
                : "outline";
        return (
          <Badge variant={variant}>
            {PRIORITY_LABELS[priority] ?? priority}
          </Badge>
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.dueDate ? formatDate(row.original.dueDate) : "-"}
        </span>
      ),
    },
    {
      accessorFn: (row) =>
        row.contact
          ? `${row.contact.firstName} ${row.contact.lastName}`
          : "",
      id: "contact",
      header: "Contact",
      cell: ({ row }) =>
        row.original.contact
          ? `${row.original.contact.firstName} ${row.original.contact.lastName}`
          : "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variant =
          status === "COMPLETED"
            ? "success"
            : status === "IN_PROGRESS"
              ? "info"
              : status === "CANCELLED"
                ? "destructive"
                : "secondary";
        return (
          <Badge variant={variant}>
            {TASK_STATUS_LABELS[status] ?? status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditTask(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteTask(row.original)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={tasks}
        searchKey="title"
        searchPlaceholder="Search tasks..."
      />

      {editTask && (
        <EditTaskDialog
          task={editTask}
          contacts={contacts}
          deals={deals}
          open={!!editTask}
          onOpenChange={(open) => {
            if (!open) setEditTask(null);
          }}
        />
      )}

      {deleteTask && (
        <DeleteTaskDialog
          task={deleteTask}
          open={!!deleteTask}
          onOpenChange={(open) => {
            if (!open) setDeleteTask(null);
          }}
        />
      )}
    </>
  );
}
