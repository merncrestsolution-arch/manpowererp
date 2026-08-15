"use client";

import { Eye, MoreHorizontal, Pencil } from "lucide-react";
import Link from "next/link";

import { DeploymentStatusBadge } from "@/components/deployment/deployment-status-badge";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatColomboDate } from "@/lib/date";

import type { DeploymentListItem } from "@/types/deployment";
import type { ColumnDef } from "@tanstack/react-table";

export function createDeploymentColumns(): ColumnDef<DeploymentListItem>[] {
  return [
    {
      accessorKey: "deploymentNo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Deployment No" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.deploymentNo}</span>
      ),
    },
    {
      accessorKey: "employeeName",
      header: "Employee",
      enableSorting: false,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.employeeName}</p>
          <p className="text-label-md text-muted-foreground">
            {row.original.employeeNo}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "clientName",
      header: "Client",
      enableSorting: false,
      cell: ({ row }) => row.original.clientName,
    },
    {
      accessorKey: "workLocationName",
      header: "Location",
      enableSorting: false,
      cell: ({ row }) => row.original.workLocationName,
    },
    {
      accessorKey: "shiftName",
      header: "Shift",
      enableSorting: false,
      cell: ({ row }) => row.original.shiftName,
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Start" />
      ),
      cell: ({ row }) => formatColomboDate(new Date(row.original.startDate)),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => <DeploymentStatusBadge status={row.original.status} />,
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
                <Link href={`/deployment/${row.original.id}`}>
                  <Eye className="size-4" />
                  View
                </Link>
              }
            />
            <DropdownMenuItem
              render={
                <Link href={`/deployment/${row.original.id}/edit`}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
