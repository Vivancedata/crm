"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { CONTACT_STATUS_LABELS, INDUSTRY_LABELS } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import type { Contact, Company } from "@prisma/client";

type ContactWithCompany = Contact & {
  company: Company | null;
};

const columns: ColumnDef<ContactWithCompany>[] = [
  {
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    id: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
          {getInitials(`${row.original.firstName} ${row.original.lastName}`)}
        </div>
        <div>
          <span className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </span>
          {row.original.title && (
            <p className="text-xs text-muted-foreground">{row.original.title}</p>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.email ?? "-"}
      </span>
    ),
  },
  {
    accessorFn: (row) => row.company?.name ?? "",
    id: "company",
    header: "Company",
    cell: ({ row }) => row.original.company?.name ?? "-",
  },
  {
    accessorFn: (row) => row.company?.industry ?? "",
    id: "industry",
    header: "Industry",
    cell: ({ row }) =>
      row.original.company ? (
        <Badge variant="outline">
          {INDUSTRY_LABELS[row.original.company.industry] ?? row.original.company.industry}
        </Badge>
      ) : (
        "-"
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const variant =
        status === "ACTIVE" ? "success" : status === "CHURNED" ? "destructive" : "secondary";
      return (
        <Badge variant={variant}>
          {CONTACT_STATUS_LABELS[status] ?? status}
        </Badge>
      );
    },
  },
];

interface ContactTableProps {
  contacts: ContactWithCompany[];
}

export function ContactTable({ contacts }: ContactTableProps) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={contacts}
      searchKey="name"
      searchPlaceholder="Search contacts..."
      onRowClick={(contact) => router.push(`/contacts/${contact.id}`)}
    />
  );
}
