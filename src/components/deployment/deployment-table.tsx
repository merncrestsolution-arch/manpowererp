"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

import { DeploymentFilters } from "@/components/deployment/deployment-filters";
import { createDeploymentColumns } from "@/components/deployment/deployment-table-columns";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import {
  defaultDeploymentFilters,
  useDeploymentsList,
} from "@/hooks/use-deployment";
import { hasAdminAccess } from "@/infrastructure/auth/roles";

import type { SortingState } from "@tanstack/react-table";

export function DeploymentTable() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role
    ? hasAdminAccess(session.user.role)
    : false;
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "startDate", desc: true },
  ]);
  const [filters, setFilters] = useState(defaultDeploymentFilters);
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebounce(searchInput);
  const activeFilters = { ...filters, search: debouncedSearch };
  const sortBy = sorting[0]?.id ?? "startDate";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading, isError } = useDeploymentsList({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    filters: activeFilters,
    sortBy,
    sortOrder,
  });

  const columns = useMemo(() => createDeploymentColumns(), []);

  return (
    <PageShell
      title="Deployments"
      description="Track worker assignments, locations, and shifts."
      actions={
        <>
          <Button
            variant="outline"
            className="h-9"
            render={<Link href="/deployment/work-locations" />}
          >
            Work locations
          </Button>
          <Button
            variant="outline"
            className="h-9"
            render={<Link href="/deployment/availability" />}
          >
            Availability
          </Button>
          <Button className="h-9" render={<Link href="/deployment/new" />}>
            <Plus className="size-4" />
            New deployment
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
            placeholder="Search deployments..."
            className="h-9 pl-9"
          />
        </div>
        <DeploymentFilters
          filters={filters}
          filterOptions={data?.filterOptions}
          isAdmin={isAdmin}
          onChange={(next) =>
            setFilters((current) => ({ ...current, ...next }))
          }
        />
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
        errorMessage={
          isError
            ? "Couldn't load deployments. Refresh the page and try again."
            : null
        }
        emptyMessage="No deployments found"
      />
    </PageShell>
  );
}
