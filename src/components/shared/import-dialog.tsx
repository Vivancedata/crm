"use client";

import { useState, useRef, useCallback, useReducer } from "react";
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

interface PreviewCell {
  id: string;
  value: string;
}

interface PreviewRow {
  id: string;
  cells: PreviewCell[];
}

interface ImportDialogState {
  file: File | null;
  csvContent: string;
  preview: PreviewRow[];
  importing: boolean;
  result: ImportResult | null;
  dragOver: boolean;
}

type ImportDialogAction =
  | { type: "reset" }
  | {
      type: "file-loaded";
      file: File;
      csvContent: string;
      preview: PreviewRow[];
    }
  | { type: "set-result"; result: ImportResult | null }
  | { type: "set-importing"; importing: boolean }
  | { type: "set-drag-over"; dragOver: boolean };

const INITIAL_STATE: ImportDialogState = {
  file: null,
  csvContent: "",
  preview: [],
  importing: false,
  result: null,
  dragOver: false,
};

function importDialogReducer(
  state: ImportDialogState,
  action: ImportDialogAction
): ImportDialogState {
  switch (action.type) {
    case "reset":
      return INITIAL_STATE;
    case "file-loaded":
      return {
        ...state,
        file: action.file,
        csvContent: action.csvContent,
        preview: action.preview,
        result: null,
        dragOver: false,
      };
    case "set-result":
      return {
        ...state,
        result: action.result,
      };
    case "set-importing":
      return {
        ...state,
        importing: action.importing,
      };
    case "set-drag-over":
      return {
        ...state,
        dragOver: action.dragOver,
      };
    default:
      return state;
  }
}

function parsePreviewRows(text: string): PreviewRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  const previewRows: PreviewRow[] = [];
  const seenRows = new Map<string, number>();

  for (let rowIndex = 0; rowIndex < Math.min(6, lines.length); rowIndex++) {
    const fields: string[] = [];
    let field = "";
    let inQuotes = false;

    for (let columnIndex = 0; columnIndex < lines[rowIndex].length; columnIndex++) {
      const char = lines[rowIndex][columnIndex];
      if (inQuotes) {
        if (char === '"') {
          if (
            columnIndex + 1 < lines[rowIndex].length &&
            lines[rowIndex][columnIndex + 1] === '"'
          ) {
            field += '"';
            columnIndex++;
          } else {
            inQuotes = false;
          }
        } else {
          field += char;
        }
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        fields.push(field.trim());
        field = "";
      } else {
        field += char;
      }
    }

    fields.push(field.trim());

    const rowKey = fields.join("|") || "empty-row";
    const rowCount = (seenRows.get(rowKey) ?? 0) + 1;
    seenRows.set(rowKey, rowCount);
    const rowId = `${rowKey}-${rowCount}`;

    previewRows.push({
      id: rowId,
      cells: fields.map((value, columnIndex) => ({
        id: `${rowId}-cell-${columnIndex}-${value || "empty"}`,
        value,
      })),
    });
  }

  return previewRows;
}

export function ImportDialog({ entityType }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, dispatch] = useReducer(importDialogReducer, INITIAL_STATE);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    dispatch({ type: "reset" });
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

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      dispatch({
        type: "file-loaded",
        file: f,
        csvContent: text,
        preview: parsePreviewRows(text),
      });
    };
    reader.readAsText(f);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dispatch({ type: "set-drag-over", dragOver: false });
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    dispatch({ type: "set-drag-over", dragOver: true });
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dispatch({ type: "set-drag-over", dragOver: false });
  }

  async function handleImport() {
    if (!state.csvContent) return;

    dispatch({ type: "set-importing", importing: true });
    try {
      let importResult: ImportResult;
      switch (entityType) {
        case "companies":
          importResult = await importCompanies(state.csvContent);
          break;
        case "contacts":
          importResult = await importContacts(state.csvContent);
          break;
        case "deals":
          importResult = await importDeals(state.csvContent);
          break;
      }

      dispatch({ type: "set-result", result: importResult });

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
      dispatch({ type: "set-importing", importing: false });
    }
  }

  const entityLabel =
    entityType.charAt(0).toUpperCase() + entityType.slice(1);
  const previewHeader = state.preview[0];
  const previewRows = state.preview.slice(1);

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

        {!state.result ? (
          <div className="space-y-4">
            {/* File Upload Area */}
            <button
              type="button"
              className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-left transition-colors ${
                state.dragOver
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
                {state.file ? state.file.name : "Drop a CSV file here or click to browse"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Only .csv files are supported
              </p>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Preview Table */}
            {state.preview.length > 0 && previewHeader && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Preview (first {Math.min(previewRows.length, 5)} rows)
                </p>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        {previewHeader.cells.map((header) => (
                          <th
                            key={header.id}
                            className="whitespace-nowrap px-3 py-2 text-left font-medium"
                          >
                            {header.value}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row) => (
                        <tr key={row.id} className="border-b last:border-0">
                          {row.cells.map((cell) => (
                            <td
                              key={cell.id}
                              className="max-w-[150px] truncate whitespace-nowrap px-3 py-2"
                            >
                              {cell.value}
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
                disabled={!state.file || state.importing}
              >
                {state.importing ? "Importing..." : "Import"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Results */}
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">
                {state.result.created} {entityType} created
                {state.result.errors.length > 0 &&
                  `, ${state.result.errors.length} errors`}
              </p>
            </div>

            {/* Error List */}
            {state.result.errors.length > 0 && (
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
                      {state.result.errors.map((err) => (
                        <tr
                          key={`${err.row}-${err.message}`}
                          className="border-b last:border-0"
                        >
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
