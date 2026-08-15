"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { DocumentRowActions } from "@/components/shared/document-row-actions";
import { formatCurrency } from "@/lib/format";

import type { InvoiceListItem } from "@/types/invoice";

function canEditInvoice(status: InvoiceListItem["status"]): boolean {
  return status !== "PAID" && status !== "CANCELLED";
}

export function createInvoiceColumns(): ColumnDef<InvoiceListItem>[] {
  return [
    {
      accessorKey: "invoiceNo",
      header: "No",
      cell: ({ row }) => (
        <Link
          href={`/invoices/${row.original.id}`}
          title={row.original.invoiceNo}
          className="text-jk-primary block truncate font-medium hover:underline"
        >
          {row.original.invoiceNo}
        </Link>
      ),
    },
    {
      accessorKey: "clientName",
      header: "Client",
      cell: ({ row }) => (
        <span className="block truncate" title={row.original.clientName}>
          {row.original.clientName}
        </span>
      ),
    },
    {
      accessorKey: "issueDate",
      header: "Issued",
      cell: ({ row }) =>
        new Date(row.original.issueDate).toLocaleDateString("en-LK"),
    },
    {
      accessorKey: "dueDate",
      header: "Due date",
      cell: ({ row }) =>
        new Date(row.original.dueDate).toLocaleDateString("en-LK"),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="block truncate tabular-nums">
          {formatCurrency(row.original.total, "LKR")}
        </span>
      ),
    },
    {
      accessorKey: "amountDue",
      header: "Due",
      cell: ({ row }) => (
        <span className="block truncate tabular-nums">
          {formatCurrency(row.original.amountDue, "LKR")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <InvoiceStatusBadge
          status={row.original.status}
          className="max-w-full truncate"
        />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      size: 48,
      cell: ({ row }) => (
        <DocumentRowActions
          viewHref={`/invoices/${row.original.id}`}
          pdfHref={`/api/invoices/${row.original.id}/pdf`}
          editHref={
            canEditInvoice(row.original.status)
              ? `/invoices/${row.original.id}/edit`
              : undefined
          }
        />
      ),
    },
  ];
}
