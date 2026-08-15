"use client";

import { AttendanceStatusBadge } from "@/components/attendance/attendance-status-badge";
import { formatColomboDate } from "@/lib/date";

import type { AttendanceListItem } from "@/types/attendance";
import type { ColumnDef } from "@tanstack/react-table";

export function createAttendanceColumns(): ColumnDef<AttendanceListItem>[] {
  return [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) =>
        formatColomboDate(new Date(row.original.date), "dd MMM yyyy"),
    },
    {
      accessorKey: "employeeName",
      header: "Employee",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.employeeName}</p>
          <p className="text-muted-foreground text-xs">
            {row.original.employeeNo}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "workLocationName",
      header: "Location",
      cell: ({ row }) => row.original.workLocationName ?? "—",
    },
    {
      accessorKey: "checkInAt",
      header: "Check-in",
      cell: ({ row }) =>
        row.original.checkInAt
          ? formatColomboDate(new Date(row.original.checkInAt), "hh:mm a")
          : "—",
    },
    {
      accessorKey: "checkOutAt",
      header: "Check-out",
      cell: ({ row }) =>
        row.original.checkOutAt
          ? formatColomboDate(new Date(row.original.checkOutAt), "hh:mm a")
          : "—",
    },
    {
      accessorKey: "workedHours",
      header: "Hours",
      cell: ({ row }) =>
        row.original.workedHours !== null
          ? `${row.original.workedHours.toFixed(2)}h`
          : "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <AttendanceStatusBadge status={row.original.status} />,
    },
  ];
}
