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
import { deleteDeal } from "@/lib/actions/deals";

interface DeleteDealDialogProps {
  dealId: string;
  dealTitle: string;
  redirectOnDelete?: boolean;
}

export function DeleteDealDialog({
  dealId,
  dealTitle,
  redirectOnDelete = false,
}: DeleteDealDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      const result = await deleteDeal(dealId);
      if (!result.success) {
        toast.error(result.error ?? "Failed to delete deal");
        return;
      }
      toast.success("Deal deleted successfully");
      setOpen(false);
      if (redirectOnDelete) {
        router.push("/deals");
      }
    } catch {
      toast.error("Failed to delete deal");
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
          <DialogTitle>Delete Deal</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{dealTitle}</strong>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete Deal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
