"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateDealStage } from "@/lib/actions/deals";

interface MarkLostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: string;
  dealTitle: string;
}

/**
 * Closing a deal as lost is the one stage change that destroys information,
 * so it is the one that asks a question first. The reason is optional -- a
 * required field would only teach people to type "n/a" -- but it is asked for
 * at the moment it is known rather than left to the edit dialog nobody opens.
 */
export function MarkLostDialog({ open, onOpenChange, dealId, dealTitle }: MarkLostDialogProps) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    setSaving(true);
    try {
      const result = await updateDealStage(dealId, "LOST", reason.trim() || undefined);
      if (!result.success) {
        toast.error(result.error ?? "Couldn't close that deal.");
        return;
      }
      toast.success(`${dealTitle} marked lost`);
      setReason("");
      onOpenChange(false);
    } catch {
      toast.error("Couldn't close that deal.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark {dealTitle} as lost</DialogTitle>
          <DialogDescription>
            It leaves the board and moves to the closed list. Note why while you
            still remember; it is the part worth reading a year from now.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="lost-reason">Reason (optional)</Label>
          <Textarea
            id="lost-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Went with an in-house build; budget pulled; never replied after the assessment."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={saving}>
            {saving ? "Closing…" : "Mark as lost"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
