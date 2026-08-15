"use client";

import { Eye, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PayrollPeriodStatusBadge } from "@/components/payroll/payroll-period-status-badge";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { usePayrollPeriods } from "@/hooks/use-payroll";
import { formatColomboDate } from "@/lib/date";
import { formatCurrency } from "@/lib/format";

import type { PayrollPeriodListItem } from "@/types/payroll";
import type { ColumnDef, SortingState } from "@tanstack/react-table";

function createPayrollPeriodColumns(): ColumnDef<PayrollPeriodListItem>[] {
  return [
    {
      accessorKey: "periodStart",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Period" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {formatColomboDate(new Date(row.original.periodStart))} –{" "}
            {formatColomboDate(new Date(row.original.periodEnd))}
          </p>
          <p className="text-label-md text-muted-foreground">
            Pay: {formatColomboDate(new Date(row.original.payDate))}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "payslipCount",
      header: "Payslips",
      enableSorting: false,
      cell: ({ row }) => row.original.payslipCount,
    },
    {
      accessorKey: "totalNet",
      header: "Total net",
      enableSorting: false,
      cell: ({ row }) => formatCurrency(row.original.totalNet),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => (
        <PayrollPeriodStatusBadge status={row.original.status} />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href={`/payroll/periods/${row.original.id}`} />}
        >
          <Eye className="size-4" />
        </Button>
      ),
    },
  ];
}

export function PayrollPeriodTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "periodStart", desc: true },
  ]);

  const sortBy = sorting[0]?.id ?? "periodStart";
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading, isError } = usePayrollPeriods({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy,
    sortOrder,
  });

  const columns = useMemo(() => createPayrollPeriodColumns(), []);

  return (
    <PageShell
      title="Payroll"
      description="Manage pay periods, run payroll, and review payslips."
      actions={
        <>
          <Button
            variant="outline"
            className="h-9"
            render={<Link href="/payroll/components-config" />}
          >
            Salary components
          </Button>
          <Button
            variant="outline"
            className="h-9"
            render={<Link href="/payroll/reports" />}
          >
            Reports
          </Button>
          <Button className="h-9" render={<Link href="/payroll/periods/new" />}>
            <Plus className="size-4" />
            New period
          </Button>
        </>
      }
    >
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        pageCount={data?.totalPages ?? 1}
        isLoading={isLoading}
        errorMessage={
          isError
            ? "Couldn't load payroll. Refresh the page and try again."
            : null
        }
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    </PageShell>
  );
}
