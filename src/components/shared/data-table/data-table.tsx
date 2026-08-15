"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { DataTablePagination } from "./data-table-pagination";

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  pageCount: number;
  totalRows?: number;
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  emptyMessage?: string;
  className?: string;
};

function getStableRowId<TData>(row: TData, index: number) {
  if (row && typeof row === "object" && "id" in row && row.id != null) {
    return String(row.id);
  }

  return `row-${index}`;
}

function columnCellClassName(columnId: string) {
  if (columnId === "actions") {
    return "w-12 max-w-12 text-right";
  }

  return "max-w-0 truncate";
}

function columnWidthStyle(columnId: string, size?: number) {
  if (columnId === "actions") {
    return { width: size ?? 48 };
  }

  return undefined;
}

export function DataTable<TData>({
  columns,
  data,
  pageCount,
  totalRows = 0,
  pagination,
  onPaginationChange,
  sorting = [],
  onSortingChange,
  isLoading = false,
  errorMessage,
  emptyMessage = "No results found.",
  className,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: { pagination, sorting },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      onPaginationChange(next);
    },
    onSortingChange: (updater) => {
      if (!onSortingChange) {
        return;
      }

      const next = typeof updater === "function" ? updater(sorting) : updater;
      onSortingChange(next);
    },
    getCoreRowModel: getCoreRowModel(),
    getRowId: getStableRowId,
    manualPagination: true,
    manualSorting: true,
    rowCount: totalRows,
  });

  const visibleColumns = table.getVisibleLeafColumns();
  const columnCount = visibleColumns.length;

  return (
    <div className={cn("min-w-0 space-y-4", className)}>
      <div className="border-border bg-card shadow-card min-w-0 overflow-hidden rounded-2xl border">
        <Table className="w-full table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "px-3",
                      columnCellClassName(header.column.id),
                    )}
                    style={columnWidthStyle(
                      header.column.id,
                      header.column.columnDef.size,
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : (flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        ) ??
                        (header.column.id === "actions" ? (
                          <span className="sr-only">Actions</span>
                        ) : null))}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pagination.pageSize }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {visibleColumns.map((column) => (
                    <TableCell
                      key={`skeleton-${rowIndex}-${column.id}`}
                      className={cn("px-3", columnCellClassName(column.id))}
                      style={columnWidthStyle(column.id, column.columnDef.size)}
                    >
                      <Skeleton className="h-4 w-24 max-w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : errorMessage ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="text-destructive h-32 text-center"
                >
                  {errorMessage}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "px-3",
                        columnCellClassName(cell.column.id),
                      )}
                      style={columnWidthStyle(
                        cell.column.id,
                        cell.column.columnDef.size,
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="text-muted-foreground h-32 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
