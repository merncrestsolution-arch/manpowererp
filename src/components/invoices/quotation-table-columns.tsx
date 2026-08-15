"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { QuotationStatusBadge } from "@/components/invoices/invoice-status-badge";
import { DocumentRowActions } from "@/components/shared/document-row-actions";
import { formatCurrency } from "@/lib/format";

import type { QuotationListItem } from "@/types/invoice";

function canEditQuotation(status: QuotationListItem["status"]): boolean {
  return status !== "CONVERTED";
}

export function createQuotationColumns(): ColumnDef<QuotationListItem>[] {
  return [
    {
      accessorKey: "quotationNo",
      header: "Quotation No",
      cell: ({ row }) => (
        <Link
          href={`/invoices/quotations/${row.original.id}`}
          className="text-jk-primary font-medium hover:underline"
        >
          {row.original.quotationNo}
        </Link>
      ),
    },
    {
      accessorKey: "clientName",
      header: "Client",
    },
    {
      accessorKey: "issueDate",
      header: "Issue Date",
      cell: ({ row }) =>
        new Date(row.original.issueDate).toLocaleDateString("en-LK"),
    },
    {
      accessorKey: "validUntil",
      header: "Valid Until",
      cell: ({ row }) =>
        new Date(row.original.validUntil).toLocaleDateString("en-LK"),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => formatCurrency(row.original.total, "LKR"),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <QuotationStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      size: 48,
      cell: ({ row }) => (
        <DocumentRowActions
          viewHref={`/invoices/quotations/${row.original.id}`}
          pdfHref={`/api/invoices/quotations/${row.original.id}/pdf`}
          editHref={
            canEditQuotation(row.original.status)
              ? `/invoices/quotations/${row.original.id}/edit`
              : undefined
          }
        />
      ),
    },
  ];
}
