"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/lib/actions/emails";
import {
  emailTemplateSchema,
  type EmailTemplateFormValues,
} from "@/lib/validations/email";
import type { EmailTemplate } from "@prisma/client";

interface TemplateManagerProps {
  templates: EmailTemplate[];
}

export function TemplateManager({ templates }: TemplateManagerProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Email Templates</h3>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Template</DialogTitle>
              <DialogDescription>Create a reusable email template.</DialogDescription>
            </DialogHeader>
            <TemplateForm
              onSubmit={async (values) => {
                const result = await createTemplate(values);
                if (!result.success) {
                  toast.error(result.error ?? "Failed to create template");
                  return;
                }
                toast.success("Template created");
                setCreateOpen(false);
              }}
              onCancel={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="text-sm text-muted-foreground">No templates yet</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create your first template
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      {template.subject}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          const result = await deleteTemplate(template.id);
                          if (!result.success) {
                            toast.error(result.error ?? "Failed to delete template");
                            return;
                          }
                          toast.success("Template deleted");
                        } catch {
                          toast.error("Failed to delete template");
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {template.category && (
                    <Badge variant="outline">{template.category}</Badge>
                  )}
                  <Badge variant={template.isActive ? "success" : "secondary"}>
                    {template.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Template Dialog */}
      <Dialog
        open={!!editingTemplate}
        onOpenChange={(open) => !open && setEditingTemplate(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>Update the email template.</DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <TemplateForm
              defaultValues={{
                name: editingTemplate.name,
                subject: editingTemplate.subject,
                body: editingTemplate.body,
                category: editingTemplate.category ?? "",
                isActive: editingTemplate.isActive,
              }}
              onSubmit={async (values) => {
                const result = await updateTemplate(editingTemplate.id, values);
                if (!result.success) {
                  toast.error(result.error ?? "Failed to update template");
                  return;
                }
                toast.success("Template updated");
                setEditingTemplate(null);
              }}
              onCancel={() => setEditingTemplate(null)}
              submitLabel="Update Template"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TemplateFormProps {
  defaultValues?: EmailTemplateFormValues;
  onSubmit: (values: EmailTemplateFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

function TemplateForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Create Template",
}: TemplateFormProps) {
  const form = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: defaultValues ?? {
      name: "",
      subject: "",
      body: "",
      category: "",
      isActive: true,
    },
  });

  async function handleSubmit(values: EmailTemplateFormValues) {
    try {
      await onSubmit(values);
      form.reset();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder="Template name..." {...field} />
              </FormControl>
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
                  placeholder="Email body..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Cold Outreach, Follow-up, Proposal"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
