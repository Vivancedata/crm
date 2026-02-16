"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteEmail } from "@/lib/actions/emails";
import { formatDate } from "@/lib/utils";
import type { Email, Contact, EmailStatus } from "@prisma/client";

type EmailWithContact = Email & {
  contact: Contact;
};

const STATUS_LABELS: Record<EmailStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  SENT: "Sent",
  OPENED: "Opened",
  CLICKED: "Clicked",
  BOUNCED: "Bounced",
  FAILED: "Failed",
};

const STATUS_VARIANT: Record<EmailStatus, "secondary" | "info" | "success" | "destructive" | "warning" | "default"> = {
  DRAFT: "secondary",
  SCHEDULED: "warning",
  SENT: "info",
  OPENED: "success",
  CLICKED: "success",
  BOUNCED: "destructive",
  FAILED: "destructive",
};

const columns: ColumnDef<EmailWithContact>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={STATUS_VARIANT[status]}>
          {STATUS_LABELS[status]}
        </Badge>
      );
    },
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.subject}</span>
    ),
  },
  {
    accessorFn: (row) => `${row.contact.firstName} ${row.contact.lastName}`,
    id: "contact",
    header: "To",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.contact.firstName} {row.original.contact.lastName}
      </span>
    ),
  },
  {
    accessorKey: "sentAt",
    header: "Sent At",
    cell: ({ row }) =>
      row.original.sentAt ? (
        <span className="text-muted-foreground">
          {formatDate(row.original.sentAt)}
        </span>
      ) : (
        <span className="text-muted-foreground">Draft</span>
      ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      async function handleDelete() {
        try {
          const result = await deleteEmail(row.original.id);
          if (!result.success) {
            toast.error(result.error ?? "Failed to delete email");
            return;
          }
          toast.success("Email deleted");
        } catch {
          toast.error("Failed to delete email");
        }
      }

      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      );
    },
  },
];

interface EmailTableProps {
  emails: EmailWithContact[];
}

export function EmailTable({ emails }: EmailTableProps) {
  return (
    <DataTable
      columns={columns}
      data={emails}
      searchKey="subject"
      searchPlaceholder="Search emails..."
    />
  );
}
