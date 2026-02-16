"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail } from "lucide-react";
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
import { sendEmail, saveDraft } from "@/lib/actions/emails";
import { emailSchema, type EmailFormValues } from "@/lib/validations/email";

interface ComposeEmailDialogProps {
  contacts: { id: string; firstName: string; lastName: string; email: string | null }[];
  templates: { id: string; name: string; subject: string; body: string; category: string | null }[];
}

export function ComposeEmailDialog({ contacts, templates }: ComposeEmailDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      subject: "",
      body: "",
      contactId: "",
      templateId: "",
    },
  });

  function handleTemplateChange(templateId: string) {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      form.setValue("subject", template.subject);
      form.setValue("body", template.body);
      form.setValue("templateId", template.id);
    }
  }

  async function onSend(values: EmailFormValues) {
    try {
      const result = await sendEmail(values);
      if (!result.success) {
        toast.error(result.error ?? "Failed to send email");
        return;
      }
      toast.success("Email sent successfully");
      setOpen(false);
      form.reset();
    } catch {
      toast.error("Failed to send email");
    }
  }

  async function onSaveDraft() {
    const values = form.getValues();
    try {
      const result = await saveDraft(values);
      if (!result.success) {
        toast.error(result.error ?? "Failed to save draft");
        return;
      }
      toast.success("Draft saved successfully");
      setOpen(false);
      form.reset();
    } catch {
      toast.error("Failed to save draft");
    }
  }

  const contactsWithEmail = contacts.filter((c) => c.email);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Mail className="h-4 w-4" />
          Compose Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
          <DialogDescription>Send an email to a contact.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSend)} className="space-y-4">
            {templates.length > 0 && (
              <div>
                <FormLabel>Template</FormLabel>
                <Select onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                        {template.category && ` — ${template.category}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <FormField
              control={form.control}
              name="contactId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a contact" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contactsWithEmail.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.firstName} {contact.lastName} ({contact.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject *</FormLabel>
                  <FormControl>
                    <Input placeholder="Email subject..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your email..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                disabled={form.formState.isSubmitting}
              >
                Save Draft
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending..." : "Send Email"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
