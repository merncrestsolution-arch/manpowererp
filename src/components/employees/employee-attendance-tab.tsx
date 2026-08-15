"use client";

import { Clock } from "lucide-react";

import { AttendanceStatusBadge } from "@/components/attendance/attendance-status-badge";
import { useEmployeeAttendance } from "@/hooks/use-employees";
import { formatColomboDate } from "@/lib/date";

type EmployeeAttendanceTabProps = {
  employeeId: string;
};

export function EmployeeAttendanceTab({
  employeeId,
}: EmployeeAttendanceTabProps) {
  const { data, isLoading } = useEmployeeAttendance(employeeId);

  return (
    <div className="space-y-jk-md">
      <div>
        <h3 className="font-heading text-title-lg">Today&apos;s attendance</h3>
        <p className="text-body-md text-muted-foreground">
          Live attendance status from check-in records.
        </p>
      </div>

      <div className="bg-card p-jk-lg shadow-card rounded-xl border">
        {isLoading ? (
          <p className="text-muted-foreground">Loading attendance...</p>
        ) : (
          <div className="gap-jk-md flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="gap-jk-sm flex items-center">
              <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                <Clock className="text-muted-foreground size-5" />
              </div>
              <div>
                <p className="font-medium">Status</p>
                <AttendanceStatusBadge
                  status={data?.status ?? "NOT_RECORDED"}
                />
              </div>
            </div>
            <div>
              <p className="text-label-md text-muted-foreground">Check-in</p>
              <p className="font-medium">
                {data?.checkInTime
                  ? formatColomboDate(new Date(data.checkInTime), "hh:mm a")
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-label-md text-muted-foreground">Check-out</p>
              <p className="font-medium">
                {data?.checkOutTime
                  ? formatColomboDate(new Date(data.checkOutTime), "hh:mm a")
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-label-md text-muted-foreground">
                Working hours
              </p>
              <p className="font-medium">{data?.workingHoursPercent ?? 0}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
