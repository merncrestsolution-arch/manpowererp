"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

import { InvoiceFilters } from "@/components/invoices/invoice-filters";
import { createQuotationColumns } from "@/components/invoices/quotation-table-columns";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import {
  defaultQuotationFilters,
  useQuotationsList,
} from "@/hooks/use-invoices";
import { hasAdminAccess } from "@/infrastructure/auth/roles";

import type { SortingState } from "@tanstack/react-table";

export function QuotationTable() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isAdmin = role ? hasAdminAccess(role) : false;
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "issueDate", desc: true },
  ]);
  const [filters, setFilters] = useState(defaultQuotationFilters);
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebounce(searchInput);
  const activeFilters = { ...filters, search: debouncedSearch };
  const sortBy = sorting[0]?.id ?? "issueDate";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading } = useQuotationsList({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    filters: activeFilters,
    sortBy,
    sortOrder,
  });

  const columns = useMemo(() => createQuotationColumns(), []);

  return (
    <PageShell
      title="Quotations"
      description="Create and convert quotations to invoices"
      actions={
        <>
          <Button
            variant="outline"
            className="h-9"
            render={<Link href="/invoices" />}
          >
            Invoices
          </Button>
          <Button
            className="h-9"
            render={<Link href="/invoices/quotations/new" />}
          >
            <Plus className="size-4" />
            New quotation
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
            placeholder="Search quotations..."
            className="pl-9"
          />
        </div>
        <InvoiceFilters
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
      />
    </PageShell>
  );
}
