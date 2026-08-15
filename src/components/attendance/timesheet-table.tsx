"use client";

import { AttendanceStatusBadge } from "@/components/attendance/attendance-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatColomboDate } from "@/lib/date";

import type { TimesheetDayEntry } from "@/types/attendance";

type TimesheetTableProps = {
  days: TimesheetDayEntry[];
};

export function TimesheetTable({ days }: TimesheetTableProps) {
  return (
    <div className="bg-card shadow-card rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Check-out</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Overtime</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {days.map((day) => (
            <TableRow key={day.date}>
              <TableCell>
                {formatColomboDate(new Date(day.date), "EEE, dd MMM")}
              </TableCell>
              <TableCell>
                {day.checkInAt
                  ? formatColomboDate(new Date(day.checkInAt), "hh:mm a")
                  : "—"}
              </TableCell>
              <TableCell>
                {day.checkOutAt
                  ? formatColomboDate(new Date(day.checkOutAt), "hh:mm a")
                  : "—"}
              </TableCell>
              <TableCell>
                {day.workedHours !== null
                  ? `${day.workedHours.toFixed(2)}h`
                  : "—"}
              </TableCell>
              <TableCell>
                {day.overtimeHours !== null
                  ? `${day.overtimeHours.toFixed(2)}h`
                  : "—"}
              </TableCell>
              <TableCell>
                <AttendanceStatusBadge status={day.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
