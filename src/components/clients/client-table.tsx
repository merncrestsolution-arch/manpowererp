"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

import { ClientFilters } from "@/components/clients/client-filters";
import { createClientColumns } from "@/components/clients/client-table-columns";
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
  defaultClientFilters,
  type ClientFiltersState,
} from "@/hooks/use-client-filters";
import { useClientsList } from "@/hooks/use-clients";
import { useDebounce } from "@/hooks/use-debounce";
import { hasAdminAccess } from "@/infrastructure/auth/roles";
import { deleteApiData } from "@/lib/api-client";

import type { ClientListItem } from "@/types/client";
import type { SortingState } from "@tanstack/react-table";

export function ClientTable() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role
    ? hasAdminAccess(session.user.role)
    : false;
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "clientNo", desc: false },
  ]);
  const [filters, setFilters] =
    useState<ClientFiltersState>(defaultClientFilters);
  const [searchInput, setSearchInput] = useState("");
  const [clientToDelete, setClientToDelete] = useState<ClientListItem | null>(
    null,
  );
  const [clientToRestore, setClientToRestore] = useState<ClientListItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const debouncedSearch = useDebounce(searchInput);
  const activeFilters = { ...filters, search: debouncedSearch };

  const sortBy = sorting[0]?.id ?? "clientNo";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading, isError } = useClientsList({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    filters: activeFilters,
    sortBy,
    sortOrder,
  });

  const columns = useMemo(
    () =>
      createClientColumns({
        isAdmin,
        onDelete: setClientToDelete,
        onRestore: setClientToRestore,
      }),
    [isAdmin],
  );

  const handleDelete = async () => {
    if (!clientToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteApiData(`/api/clients/${clientToDelete.id}`);
      setClientToDelete(null);
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async () => {
    if (!clientToRestore) {
      return;
    }

    setIsRestoring(true);

    try {
      await deleteApiData(`/api/clients/${clientToRestore.id}?action=restore`);
      setClientToRestore(null);
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <PageShell
      title="Clients"
      description="Manage client accounts, contracts, contacts, and worker assignments."
      actions={
        <Button className="h-9" render={<Link href="/clients/new" />}>
          <Plus className="size-4" />
          Add client
        </Button>
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
            placeholder="Search by company, client no, registration, or city..."
            className="h-9 pl-9"
          />
        </div>
        <ClientFilters
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
            ? "Couldn't load clients. Refresh the page and try again."
            : null
        }
        emptyMessage="No clients found. Add your first client to get started."
      />

      <Dialog
        open={Boolean(clientToDelete)}
        onOpenChange={(open) => !open && setClientToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete client</DialogTitle>
            <DialogDescription>
              This will soft-delete{" "}
              <strong>{clientToDelete?.companyName}</strong>. The record can be
              restored by an administrator.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClientToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              Delete client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(clientToRestore)}
        onOpenChange={(open) => !open && setClientToRestore(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore client</DialogTitle>
            <DialogDescription>
              Restore <strong>{clientToRestore?.companyName}</strong> to the
              active client directory?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClientToRestore(null)}>
              Cancel
            </Button>
            <Button onClick={handleRestore} disabled={isRestoring}>
              Restore client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
