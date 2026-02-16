"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateDeal } from "@/lib/actions/deals";
import { dealSchema, type DealFormValues } from "@/lib/validations/deal";
import { DEAL_STAGE_LABELS, SERVICE_TYPE_LABELS } from "@/lib/constants";
import type { Deal } from "@prisma/client";

interface EditDealDialogProps {
  deal: Deal;
  companies: { id: string; name: string }[];
  contacts: { id: string; firstName: string; lastName: string }[];
}

export function EditDealDialog({ deal, companies, contacts }: EditDealDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: deal.title,
      value: deal.value ? Number(deal.value) : undefined,
      stage: deal.stage,
      probability: deal.probability,
      expectedClose: deal.expectedClose
        ? new Date(deal.expectedClose).toISOString().split("T")[0]
        : "",
      description: deal.description ?? "",
      serviceType: deal.serviceType,
      companyId: deal.companyId ?? "",
      contactId: deal.contactId ?? "",
      lostReason: deal.lostReason ?? "",
    },
  });

  const watchedStage = form.watch("stage");

  async function onSubmit(values: DealFormValues) {
    try {
      const result = await updateDeal(deal.id, values);
      if (!result.success) {
        toast.error(result.error ?? "Failed to update deal");
        return;
      }
      toast.success("Deal updated successfully");
      setOpen(false);
    } catch {
      toast.error("Failed to update deal");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Deal</DialogTitle>
          <DialogDescription>Update the details of this deal.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deal Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="AI Workflow Automation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="25000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedClose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Close</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(DEAL_STAGE_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(SERVICE_TYPE_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No company</SelectItem>
                        {companies.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select contact" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No contact</SelectItem>
                        {contacts.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.firstName} {c.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Deal details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedStage === "LOST" && (
              <FormField
                control={form.control}
                name="lostReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lost Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Why was this deal lost?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
