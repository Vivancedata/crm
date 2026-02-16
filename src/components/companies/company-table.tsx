"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { INDUSTRY_LABELS, COMPANY_SIZE_LABELS } from "@/lib/constants";
import { getInitials, formatDate } from "@/lib/utils";
import type { Company } from "@prisma/client";

const columns: ColumnDef<Company>[] = [
  {
    accessorKey: "name",
    header: "Company",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
          {getInitials(row.original.name)}
        </div>
        <div>
          <span className="font-medium">{row.original.name}</span>
          {row.original.website && (
            <p className="text-xs text-muted-foreground">{row.original.website}</p>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "industry",
    header: "Industry",
    cell: ({ row }) => (
      <Badge variant="outline">
        {INDUSTRY_LABELS[row.original.industry] ?? row.original.industry}
      </Badge>
    ),
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) =>
      COMPANY_SIZE_LABELS[row.original.size] ?? row.original.size,
  },
  {
    accessorKey: "city",
    header: "Location",
    cell: ({ row }) => {
      const parts = [row.original.city, row.original.state].filter(Boolean);
      return parts.length > 0 ? (
        <span className="text-muted-foreground">{parts.join(", ")}</span>
      ) : (
        <span className="text-muted-foreground/50">-</span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Added",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
];

interface CompanyTableProps {
  companies: Company[];
}

export function CompanyTable({ companies }: CompanyTableProps) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={companies}
      searchKey="name"
      searchPlaceholder="Search companies..."
      onRowClick={(company) => router.push(`/companies/${company.id}`)}
    />
  );
}
