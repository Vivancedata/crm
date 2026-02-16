"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { deleteContact } from "@/lib/actions/contacts";

interface DeleteContactDialogProps {
  contactId: string;
  contactName: string;
  redirectOnDelete?: boolean;
}

export function DeleteContactDialog({
  contactId,
  contactName,
  redirectOnDelete = false,
}: DeleteContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      const result = await deleteContact(contactId);
      if (!result.success) {
        toast.error(result.error ?? "Failed to delete contact");
        return;
      }
      toast.success("Contact deleted successfully");
      setOpen(false);
      if (redirectOnDelete) {
        router.push("/contacts");
      }
    } catch {
      toast.error("Failed to delete contact");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Contact</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{contactName}</strong>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete Contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
