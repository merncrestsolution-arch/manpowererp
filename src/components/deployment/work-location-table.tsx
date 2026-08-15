"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { PageShell } from "@/components/shared/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import {
  defaultWorkLocationFilters,
  useWorkLocationsList,
} from "@/hooks/use-deployment";

import type { WorkLocationListItem } from "@/types/deployment";
import type { ColumnDef, SortingState } from "@tanstack/react-table";

function createWorkLocationColumns(): ColumnDef<WorkLocationListItem>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-label-md text-muted-foreground">
            {row.original.city ?? "No city"}
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
      accessorKey: "activeDeployments",
      header: "Active deployments",
      enableSorting: false,
      cell: ({ row }) => row.original.activeDeployments,
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            row.original.status === "ACTIVE"
              ? "bg-jk-secondary-container/30 text-jk-secondary border-transparent"
              : "bg-muted text-muted-foreground border-transparent"
          }
        >
          {row.original.status === "ACTIVE" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          render={
            <Link href={`/deployment/work-locations/${row.original.id}`} />
          }
        >
          View
        </Button>
      ),
    },
  ];
}

export function WorkLocationTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [filters, setFilters] = useState(defaultWorkLocationFilters);
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebounce(searchInput);
  const activeFilters = { ...filters, search: debouncedSearch };
  const sortBy = sorting[0]?.id ?? "name";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading } = useWorkLocationsList({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    filters: activeFilters,
    sortBy,
    sortOrder,
  });

  const columns = useMemo(() => createWorkLocationColumns(), []);

  return (
    <PageShell
      title="Work locations"
      description="Client sites for worker deployment and GPS attendance"
      actions={
        <>
          <Button
            variant="outline"
            className="h-9"
            render={<Link href="/deployment" />}
          >
            Deployments
          </Button>
          <Button
            className="h-9"
            render={<Link href="/deployment/work-locations/new" />}
          >
            <Plus className="size-4" />
            New location
          </Button>
        </>
      }
    >
      <DataTableToolbar>
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search locations..."
            className="pl-9"
          />
        </div>
        <Select
          value={filters.status}
          onChange={(event) =>
            setFilters({ ...filters, status: event.target.value })
          }
          className="w-[160px]"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
      </DataTableToolbar>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        pageCount={data?.totalPages ?? 1}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={isLoading}
        emptyMessage="No work locations found"
      />
    </PageShell>
  );
}
