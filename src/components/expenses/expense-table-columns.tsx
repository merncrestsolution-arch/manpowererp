"use client";

import { Download, Eye, MoreHorizontal, Pencil } from "lucide-react";
import Link from "next/link";

import { ExpenseStatusBadge } from "@/components/expenses/expense-status-badge";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatColomboDate } from "@/lib/date";
import { formatCurrency } from "@/lib/format";

import type { ExpenseListItem } from "@/types/expense";
import type { ColumnDef } from "@tanstack/react-table";

export function createExpenseColumns(): ColumnDef<ExpenseListItem>[] {
  return [
    {
      accessorKey: "expenseNo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expense No" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.expenseNo}</span>
      ),
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      enableSorting: false,
      cell: ({ row }) => row.original.categoryName,
    },
    {
      accessorKey: "description",
      header: "Description",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-[240px]">
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: "expenseDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => formatColomboDate(new Date(row.original.expenseDate)),
    },
    {
      accessorKey: "paidByName",
      header: "Submitted by",
      enableSorting: false,
      cell: ({ row }) => row.original.paidByName,
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => <ExpenseStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="ml-auto" />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              render={
                <Link href={`/expenses/${row.original.id}`}>
                  <Eye className="size-4" />
                  View
                </Link>
              }
            />
            {row.original.status === "PENDING" ||
            row.original.status === "REJECTED" ? (
              <DropdownMenuItem
                render={
                  <Link href={`/expenses/${row.original.id}/edit`}>
                    <Pencil className="size-4" />
                    Edit
                  </Link>
                }
              />
            ) : null}
            <DropdownMenuItem
              render={
                <a href={`/api/expenses/${row.original.id}/pdf`} download>
                  <Download className="size-4" />
                  Download PDF
                </a>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
