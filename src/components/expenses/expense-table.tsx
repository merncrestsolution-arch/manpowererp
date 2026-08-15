"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

import { ExpenseFilters } from "@/components/expenses/expense-filters";
import { createExpenseColumns } from "@/components/expenses/expense-table-columns";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { defaultExpenseFilters, useExpensesList } from "@/hooks/use-expenses";
import { canApproveExpense, hasAdminAccess } from "@/infrastructure/auth/roles";

import type { SortingState } from "@tanstack/react-table";

export function ExpenseTable() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isAdmin = role ? hasAdminAccess(role) : false;
  const canApprove = role ? canApproveExpense(role) : false;
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "expenseDate", desc: true },
  ]);
  const [filters, setFilters] = useState(defaultExpenseFilters);
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebounce(searchInput);
  const activeFilters = { ...filters, search: debouncedSearch };
  const sortBy = sorting[0]?.id ?? "expenseDate";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading, isError } = useExpensesList({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    filters: activeFilters,
    sortBy,
    sortOrder,
  });

  const columns = useMemo(() => createExpenseColumns(), []);

  return (
    <PageShell
      title="Expenses"
      description="Track submissions, approvals, and reimbursements."
      actions={
        <>
          {canApprove ? (
            <>
              <Button
                variant="outline"
                className="h-9"
                render={<Link href="/expenses/approvals" />}
              >
                Approvals
              </Button>
              <Button
                variant="outline"
                className="h-9"
                render={<Link href="/expenses/reports" />}
              >
                Reports
              </Button>
              <Button
                variant="outline"
                className="h-9"
                render={<Link href="/expenses/categories" />}
              >
                Categories
              </Button>
            </>
          ) : null}
          <Button className="h-9" render={<Link href="/expenses/new" />}>
            <Plus className="size-4" />
            Submit expense
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
            placeholder="Search expenses..."
            className="h-9 pl-9"
          />
        </div>
        <ExpenseFilters
          filters={filters}
          filterOptions={data?.filterOptions}
          isAdmin={isAdmin}
          onChange={setFilters}
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
            ? "Couldn't load expenses. Refresh the page and try again."
            : null
        }
        emptyMessage="No expenses found"
      />
    </PageShell>
  );
}
