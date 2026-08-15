"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

import { EmployeeFilters } from "@/components/employees/employee-filters";
import { createEmployeeColumns } from "@/components/employees/employee-table-columns";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  defaultEmployeeFilters,
  useDebounce,
  type EmployeeFiltersState,
} from "@/hooks/use-debounce";
import { useEmployeesList } from "@/hooks/use-employees";
import { hasAdminAccess } from "@/infrastructure/auth/roles";
import { deleteApiData } from "@/lib/api-client";

import type { EmployeeListItem } from "@/types/employee";
import type { SortingState } from "@tanstack/react-table";

export function EmployeeTable() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role
    ? hasAdminAccess(session.user.role)
    : false;
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "employeeNo", desc: false },
  ]);
  const [filters, setFilters] = useState<EmployeeFiltersState>(
    defaultEmployeeFilters,
  );
  const [searchInput, setSearchInput] = useState("");
  const [employeeToDelete, setEmployeeToDelete] =
    useState<EmployeeListItem | null>(null);
  const [employeeToRestore, setEmployeeToRestore] =
    useState<EmployeeListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const debouncedSearch = useDebounce(searchInput);
  const activeFilters = { ...filters, search: debouncedSearch };

  const sortBy = sorting[0]?.id ?? "employeeNo";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading, isError } = useEmployeesList({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    filters: activeFilters,
    sortBy,
    sortOrder,
  });

  const columns = useMemo(
    () =>
      createEmployeeColumns({
        isAdmin,
        onDelete: setEmployeeToDelete,
        onRestore: setEmployeeToRestore,
      }),
    [isAdmin],
  );

  const handleDelete = async () => {
    if (!employeeToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteApiData(`/api/employees/${employeeToDelete.id}`);
      setEmployeeToDelete(null);
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async () => {
    if (!employeeToRestore) {
      return;
    }

    setIsRestoring(true);

    try {
      await deleteApiData(
        `/api/employees/${employeeToRestore.id}?action=restore`,
      );
      setEmployeeToRestore(null);
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <PageShell
      title="Employees"
      description="Manage your workforce directory, profiles, and assignments."
      actions={
        <>
          <Button
            variant="outline"
            className="h-9"
            render={<Link href="/attendance" />}
          >
            Attendance
          </Button>
          <Button className="h-9" render={<Link href="/employees/new" />}>
            <Plus className="size-4" />
            Add employee
          </Button>
        </>
      }
    >
      <DataTableToolbar>
        <div className="relative w-full max-w-md">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPagination((current) => ({ ...current, pageIndex: 0 }));
            }}
            placeholder="Search by name, employee no, NIC, or email..."
            className="h-9 pl-9"
          />
        </div>
        <EmployeeFilters
          filters={filters}
          filterOptions={data?.filterOptions}
          showDeletedToggle={isAdmin}
          onChange={(next) => {
            setFilters(next);
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }}
        />
      </DataTableToolbar>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        pageCount={data?.totalPages ?? 1}
        totalRows={data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={isLoading}
        errorMessage={
          isError
            ? "Couldn't load employees. Refresh the page and try again."
            : null
        }
        emptyMessage="No employees found. Add your first employee to get started."
      />

      <Dialog
        open={Boolean(employeeToDelete)}
        onOpenChange={(open) => !open && setEmployeeToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete employee</DialogTitle>
            <DialogDescription>
              This will soft-delete{" "}
              <strong>
                {employeeToDelete?.firstName} {employeeToDelete?.lastName}
              </strong>
              . The record can be restored by an administrator.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmployeeToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              Delete employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(employeeToRestore)}
        onOpenChange={(open) => !open && setEmployeeToRestore(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore employee</DialogTitle>
            <DialogDescription>
              Restore{" "}
              <strong>
                {employeeToRestore?.firstName} {employeeToRestore?.lastName}
              </strong>{" "}
              to the active employee directory?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmployeeToRestore(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleRestore} disabled={isRestoring}>
              Restore employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
