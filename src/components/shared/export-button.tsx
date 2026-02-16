"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  exportCompanies,
  exportContacts,
  exportDeals,
} from "@/lib/actions/import-export";

interface ExportButtonProps {
  entityType: "companies" | "contacts" | "deals";
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function ExportButton({
  entityType,
  variant = "outline",
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      let csv: string;
      switch (entityType) {
        case "companies":
          csv = await exportCompanies();
          break;
        case "contacts":
          csv = await exportContacts();
          break;
        case "deals":
          csv = await exportDeals();
          break;
      }

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${entityType}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`${entityType} exported successfully`);
    } catch {
      toast.error(`Failed to export ${entityType}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={variant}
      className="gap-2"
      onClick={handleExport}
      disabled={loading}
    >
      <Download className="h-4 w-4" />
      {loading ? "Exporting..." : "Export CSV"}
    </Button>
  );
}
