"use client";

import { Eye, MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";

import { EmployeeStatusBadge } from "@/components/employees/employee-status-badge";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatColomboDate } from "@/lib/date";

import type { EmployeeListItem } from "@/types/employee";
import type { ColumnDef } from "@tanstack/react-table";

type CreateEmployeeColumnsOptions = {
  isAdmin: boolean;
  onDelete: (employee: EmployeeListItem) => void;
  onRestore: (employee: EmployeeListItem) => void;
};

export function createEmployeeColumns({
  isAdmin,
  onDelete,
  onRestore,
}: CreateEmployeeColumnsOptions): ColumnDef<EmployeeListItem>[] {
  return [
    {
      accessorKey: "employeeNo",
      size: 140,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee No" />
      ),
      cell: ({ row }) => (
        <span className="text-foreground font-medium whitespace-nowrap">
          {row.original.employeeNo}
        </span>
      ),
    },
    {
      id: "name",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      enableSorting: false,
      size: 220,
      header: "Name",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">
            {row.original.firstName} {row.original.lastName}
          </p>
          <p className="text-label-md text-muted-foreground truncate">
            {row.original.email ?? "No email"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "department",
      enableSorting: false,
      size: 150,
      header: "Department",
      cell: ({ row }) => (
        <span className="truncate">{row.original.department ?? "—"}</span>
      ),
    },
    {
      accessorKey: "designation",
      enableSorting: false,
      size: 170,
      header: "Designation",
      cell: ({ row }) => (
        <span className="truncate">{row.original.designation ?? "—"}</span>
      ),
    },
    {
      accessorKey: "employmentType",
      enableSorting: false,
      size: 120,
      header: "Type",
      cell: ({ row }) => (
        <span className="capitalize">
          {row.original.employmentType.replaceAll("_", " ").toLowerCase()}
        </span>
      ),
    },
    {
      accessorKey: "status",
      enableSorting: false,
      size: 130,
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <EmployeeStatusBadge status={row.original.status} />
          {row.original.deletedAt ? (
            <Badge variant="outline" className="text-muted-foreground">
              Deleted
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "joinedAt",
      size: 130,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Joined" />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {row.original.joinedAt
            ? formatColomboDate(new Date(row.original.joinedAt), "dd MMM yyyy")
            : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      size: 48,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const isDeleted = Boolean(row.original.deletedAt);

        return (
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
                  <Link href={`/employees/${row.original.id}`}>
                    <Eye className="size-4" />
                    View profile
                  </Link>
                }
              />
              {!isDeleted ? (
                <>
                  <DropdownMenuItem
                    render={
                      <Link href={`/employees/${row.original.id}/edit`}>
                        <Pencil className="size-4" />
                        Edit
                      </Link>
                    }
                  />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(row.original)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              ) : isAdmin ? (
                <DropdownMenuItem onClick={() => onRestore(row.original)}>
                  <RotateCcw className="size-4" />
                  Restore
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
