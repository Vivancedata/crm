"use client";

import { useState, useRef, useCallback } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
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
import {
  importCompanies,
  importContacts,
  importDeals,
} from "@/lib/actions/import-export";

interface ImportDialogProps {
  entityType: "companies" | "contacts" | "deals";
}

type ImportResult = {
  created: number;
  errors: { row: number; message: string }[];
};

export function ImportDialog({ entityType }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>("");
  const [preview, setPreview] = useState<string[][]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setFile(null);
    setCsvContent("");
    setPreview([]);
    setResult(null);
    setImporting(false);
    setDragOver(false);
  }

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) reset();
  }

  const processFile = useCallback((f: File) => {
    if (!f.name.endsWith(".csv")) {
      toast.error("Please select a CSV file");
      return;
    }

    setFile(f);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvContent(text);

      // Parse preview (first 6 rows: header + 5 data rows)
      const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
      const previewRows: string[][] = [];
      for (let i = 0; i < Math.min(6, lines.length); i++) {
        // Simple split for preview (handles basic cases)
        const fields: string[] = [];
        let field = "";
        let inQuotes = false;
        for (let j = 0; j < lines[i].length; j++) {
          const char = lines[i][j];
          if (inQuotes) {
            if (char === '"') {
              if (j + 1 < lines[i].length && lines[i][j + 1] === '"') {
                field += '"';
                j++;
              } else {
                inQuotes = false;
              }
            } else {
              field += char;
            }
          } else {
            if (char === '"') {
              inQuotes = true;
            } else if (char === ",") {
              fields.push(field.trim());
              field = "";
            } else {
              field += char;
            }
          }
        }
        fields.push(field.trim());
        previewRows.push(fields);
      }
      setPreview(previewRows);
    };
    reader.readAsText(f);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  async function handleImport() {
    if (!csvContent) return;

    setImporting(true);
    try {
      let importResult: ImportResult;
      switch (entityType) {
        case "companies":
          importResult = await importCompanies(csvContent);
          break;
        case "contacts":
          importResult = await importContacts(csvContent);
          break;
        case "deals":
          importResult = await importDeals(csvContent);
          break;
      }

      setResult(importResult);

      if (importResult.created > 0) {
        toast.success(
          `${importResult.created} ${entityType} imported successfully`
        );
      }
      if (importResult.errors.length > 0) {
        toast.error(`${importResult.errors.length} rows had errors`);
      }
    } catch {
      toast.error(`Failed to import ${entityType}`);
    } finally {
      setImporting(false);
    }
  }

  const entityLabel =
    entityType.charAt(0).toUpperCase() + entityType.slice(1);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import {entityLabel}</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import {entityType} in bulk.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            {/* File Upload Area */}
            <div
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                {file ? file.name : "Drop a CSV file here or click to browse"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Only .csv files are supported
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Preview Table */}
            {preview.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Preview (first {Math.min(preview.length - 1, 5)} rows)
                </p>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        {preview[0].map((header, i) => (
                          <th
                            key={i}
                            className="whitespace-nowrap px-3 py-2 text-left font-medium"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(1).map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          {row.map((cell, j) => (
                            <td
                              key={j}
                              className="max-w-[150px] truncate whitespace-nowrap px-3 py-2"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!file || importing}
              >
                {importing ? "Importing..." : "Import"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Results */}
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">
                {result.created} {entityType} created
                {result.errors.length > 0 &&
                  `, ${result.errors.length} errors`}
              </p>
            </div>

            {/* Error List */}
            {result.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-destructive">Errors</p>
                <div className="max-h-[200px] overflow-y-auto rounded-md border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-3 py-2 text-left font-medium">
                          Row
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((err, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-3 py-2">{err.row}</td>
                          <td className="px-3 py-2">{err.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
