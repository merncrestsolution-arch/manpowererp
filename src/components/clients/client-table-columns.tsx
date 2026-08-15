"use client";

import { Eye, MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";

import { ClientStatusBadge } from "@/components/clients/client-status-badge";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { ClientListItem } from "@/types/client";
import type { ColumnDef } from "@tanstack/react-table";

type CreateClientColumnsOptions = {
  isAdmin: boolean;
  onDelete: (client: ClientListItem) => void;
  onRestore: (client: ClientListItem) => void;
};

export function createClientColumns({
  isAdmin,
  onDelete,
  onRestore,
}: CreateClientColumnsOptions): ColumnDef<ClientListItem>[] {
  return [
    {
      accessorKey: "clientNo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Client No" />
      ),
      cell: ({ row }) => (
        <span className="text-foreground font-medium">
          {row.original.clientNo}
        </span>
      ),
    },
    {
      accessorKey: "companyName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Company" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.companyName}</p>
          <p className="text-label-md text-muted-foreground">
            {row.original.primaryContactName ?? "No primary contact"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "industry",
      enableSorting: false,
      header: "Industry",
      cell: ({ row }) => row.original.industry ?? "—",
    },
    {
      accessorKey: "city",
      enableSorting: false,
      header: "City",
      cell: ({ row }) => row.original.city ?? "—",
    },
    {
      accessorKey: "status",
      enableSorting: false,
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ClientStatusBadge status={row.original.status} />
          {row.original.deletedAt ? (
            <Badge variant="outline" className="text-muted-foreground">
              Deleted
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "creditTermDays",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Credit Terms" />
      ),
      cell: ({ row }) => `${row.original.creditTermDays} days`,
    },
    {
      id: "actions",
      enableSorting: false,
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
                  <Link href={`/clients/${row.original.id}`}>
                    <Eye className="size-4" />
                    View profile
                  </Link>
                }
              />
              {!isDeleted ? (
                <>
                  <DropdownMenuItem
                    render={
                      <Link href={`/clients/${row.original.id}/edit`}>
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
