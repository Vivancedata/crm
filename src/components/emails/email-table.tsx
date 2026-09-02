"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
    cell: ({ row }) => <DeleteEmailButton email={row.original} />,
  },
];

/**
 * Deleting an email used to happen on the first click of an unlabeled icon --
 * no confirmation, no undo, and the row was gone. It is the only destructive
 * control in the app that behaved that way.
 */
function DeleteEmailButton({ email }: { email: EmailWithContact }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const result = await deleteEmail(email.id);
      if (!result.success) {
        toast.error(result.error ?? "Couldn't delete that email.");
        return;
      }
      toast.success("Email deleted");
      setOpen(false);
    } catch {
      toast.error("Couldn't delete that email.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Delete email "${email.subject}"`}
          onClick={(event) => event.stopPropagation()}
        >
          <Trash2 aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(event) => event.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Delete this email?</DialogTitle>
          <DialogDescription>
            <strong>{email.subject}</strong> will be removed from the record for{" "}
            {email.contact.firstName} {email.contact.lastName}. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
