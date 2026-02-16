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
import { deleteCompany } from "@/lib/actions/companies";

interface DeleteCompanyDialogProps {
  companyId: string;
  companyName: string;
  redirectOnDelete?: boolean;
}

export function DeleteCompanyDialog({
  companyId,
  companyName,
  redirectOnDelete = false,
}: DeleteCompanyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      const result = await deleteCompany(companyId);
      if (!result.success) {
        toast.error(result.error ?? "Failed to delete company. It may have related contacts or deals.");
        return;
      }
      toast.success("Company deleted successfully");
      setOpen(false);
      if (redirectOnDelete) {
        router.push("/companies");
      }
    } catch {
      toast.error("Failed to delete company. It may have related contacts or deals.");
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
          <DialogTitle>Delete Company</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{companyName}</strong>? This
            action cannot be undone. All associated data will be permanently
            removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Company"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
