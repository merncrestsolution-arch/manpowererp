"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

import { CandidateFilters } from "@/components/recruitment/candidate-filters";
import { createCandidateColumns } from "@/components/recruitment/candidate-table-columns";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
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
import { useDebounce } from "@/hooks/use-debounce";
import { useCandidatesList } from "@/hooks/use-recruitment";
import {
  defaultCandidateFilters,
  type CandidateFiltersState,
} from "@/hooks/use-recruitment-filters";
import { hasAdminAccess } from "@/infrastructure/auth/roles";
import { deleteApiData } from "@/lib/api-client";

import type { CandidateListItem } from "@/types/recruitment";
import type { SortingState } from "@tanstack/react-table";

export function CandidateTable() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role
    ? hasAdminAccess(session.user.role)
    : false;
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [filters, setFilters] = useState<CandidateFiltersState>(
    defaultCandidateFilters,
  );
  const [searchInput, setSearchInput] = useState("");
  const [toDelete, setToDelete] = useState<CandidateListItem | null>(null);
  const [toRestore, setToRestore] = useState<CandidateListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const debouncedSearch = useDebounce(searchInput);
  const activeFilters = { ...filters, search: debouncedSearch };
  const sortBy = sorting[0]?.id ?? "createdAt";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading, isError } = useCandidatesList({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    filters: activeFilters,
    sortBy,
    sortOrder,
  });

  const columns = useMemo(
    () =>
      createCandidateColumns({
        isAdmin,
        onDelete: setToDelete,
        onRestore: setToRestore,
      }),
    [isAdmin],
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["recruitment"] });

  const handleDelete = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    try {
      await deleteApiData(`/api/recruitment/candidates/${toDelete.id}`);
      setToDelete(null);
      await invalidate();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async () => {
    if (!toRestore) return;
    setIsRestoring(true);
    try {
      await deleteApiData(
        `/api/recruitment/candidates/${toRestore.id}?action=restore`,
      );
      setToRestore(null);
      await invalidate();
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <>
      <DataTableToolbar>
        <div className="relative w-full max-w-md">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPagination((c) => ({ ...c, pageIndex: 0 }));
            }}
            placeholder="Search candidates..."
            className="h-9 pl-9"
          />
        </div>
        <CandidateFilters
          filters={filters}
          showDeletedToggle={isAdmin}
          onChange={(next) => {
            setFilters(next);
            setPagination((c) => ({ ...c, pageIndex: 0 }));
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
            ? "Couldn't load candidates. Refresh the page and try again."
            : null
        }
        emptyMessage="No candidates found."
      />

      <Dialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete candidate</DialogTitle>
            <DialogDescription>
              Soft-delete{" "}
              <strong>
                {toDelete?.firstName} {toDelete?.lastName}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(toRestore)}
        onOpenChange={(o) => !o && setToRestore(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore candidate</DialogTitle>
            <DialogDescription>
              Restore{" "}
              <strong>
                {toRestore?.firstName} {toRestore?.lastName}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToRestore(null)}>
              Cancel
            </Button>
            <Button onClick={handleRestore} disabled={isRestoring}>
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
