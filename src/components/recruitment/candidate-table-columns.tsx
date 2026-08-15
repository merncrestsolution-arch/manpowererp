"use client";

import { Eye, MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";

import { CandidateStatusBadge } from "@/components/recruitment/candidate-status-badge";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { CandidateListItem } from "@/types/recruitment";
import type { ColumnDef } from "@tanstack/react-table";

type CreateCandidateColumnsOptions = {
  isAdmin: boolean;
  onDelete: (candidate: CandidateListItem) => void;
  onRestore: (candidate: CandidateListItem) => void;
};

export function createCandidateColumns({
  isAdmin,
  onDelete,
  onRestore,
}: CreateCandidateColumnsOptions): ColumnDef<CandidateListItem>[] {
  return [
    {
      accessorKey: "candidateNo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Candidate No" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.candidateNo}</span>
      ),
    },
    {
      id: "name",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      enableSorting: false,
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </p>
          <p className="text-label-md text-muted-foreground">
            {row.original.email ?? "No email"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "jobOpeningTitle",
      enableSorting: false,
      header: "Applied for",
      cell: ({ row }) =>
        row.original.appliedFor ?? row.original.jobOpeningTitle,
    },
    {
      accessorKey: "source",
      enableSorting: false,
      header: "Source",
      cell: ({ row }) => row.original.source.replaceAll("_", " ").toLowerCase(),
    },
    {
      accessorKey: "status",
      enableSorting: false,
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CandidateStatusBadge status={row.original.status} />
          {row.original.deletedAt ? (
            <Badge variant="outline">Deleted</Badge>
          ) : null}
        </div>
      ),
    },
    {
      id: "daysInStage",
      enableSorting: false,
      header: "Days in stage",
      cell: ({ row }) => `${row.original.daysInStage}d`,
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
                  <Link href={`/recruitment/candidates/${row.original.id}`}>
                    <Eye className="size-4" />
                    View profile
                  </Link>
                }
              />
              {!isDeleted ? (
                <>
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
