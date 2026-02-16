"use client";

import { useState } from "react";
import { generateEmailDraft } from "@/lib/actions/ai";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface EmailDraftButtonProps {
  contactId: string;
  context?: string;
  onDraftGenerated: (subject: string, body: string) => void;
}

export function EmailDraftButton({
  contactId,
  context,
  onDraftGenerated,
}: EmailDraftButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await generateEmailDraft(contactId, context);
      if (!result.success) {
        console.error("Failed to generate email draft:", result.error);
        return;
      }
      onDraftGenerated(result.subject, result.body);
    } catch (err) {
      console.error("Failed to generate email draft:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleGenerate}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {loading ? "Generating..." : "AI Draft"}
    </Button>
  );
}
