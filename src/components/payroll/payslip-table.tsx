"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { PayslipStatusBadge } from "@/components/payroll/payroll-period-status-badge";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { usePayslips } from "@/hooks/use-payroll";
import { formatCurrency } from "@/lib/format";

import type { PayslipListItem } from "@/types/payroll";
import type { ColumnDef } from "@tanstack/react-table";

function createPayslipColumns(): ColumnDef<PayslipListItem>[] {
  return [
    {
      accessorKey: "payslipNo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payslip No" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.payslipNo}</span>
      ),
    },
    {
      accessorKey: "employeeName",
      header: "Employee",
      enableSorting: false,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.employeeName}</p>
          <p className="text-label-md text-muted-foreground">
            {row.original.employeeNo}
            {row.original.department ? ` · ${row.original.department}` : ""}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "grossSalary",
      header: "Gross",
      enableSorting: false,
      cell: ({ row }) => formatCurrency(row.original.grossSalary),
    },
    {
      accessorKey: "netSalary",
      header: "Net",
      enableSorting: false,
      cell: ({ row }) => formatCurrency(row.original.netSalary),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => <PayslipStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href={`/payroll/payslips/${row.original.id}`} />}
        >
          <Eye className="size-4" />
        </Button>
      ),
    },
  ];
}

type PayslipTableProps = {
  payrollPeriodId: string;
};

export function PayslipTable({ payrollPeriodId }: PayslipTableProps) {
  const { data, isLoading } = usePayslips({ payrollPeriodId, pageSize: 100 });
  const columns = useMemo(() => createPayslipColumns(), []);

  return (
    <DataTable
      columns={columns}
      data={data?.items ?? []}
      pageCount={1}
      isLoading={isLoading}
      pagination={{ pageIndex: 0, pageSize: 100 }}
      onPaginationChange={() => undefined}
      sorting={[]}
      onSortingChange={() => undefined}
      totalRows={data?.total ?? 0}
    />
  );
}
