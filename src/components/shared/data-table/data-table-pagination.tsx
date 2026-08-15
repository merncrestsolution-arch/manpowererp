"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

import type { Table } from "@tanstack/react-table";

type DataTablePaginationProps<TData> = {
  table: Table<TData>;
};

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const totalRows = table.getRowCount();

  return (
    <div className="border-border bg-card shadow-card flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-body-md text-muted-foreground">
        Page {pageIndex + 1} of {pageCount}
        {totalRows > 0 ? ` · ${totalRows} total` : ""}
      </p>
      <div className="gap-jk-sm flex items-center">
        <div className="flex items-center gap-2">
          <span className="text-label-md text-muted-foreground">Rows</span>
          <Select
            value={String(pageSize)}
            onChange={(event) => {
              table.setPageSize(Number(event.target.value));
              table.setPageIndex(0);
            }}
            className="h-8 w-20"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </div>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
