"use client";

import Link from "next/link";
import { use } from "react";

import { TimesheetSummaryCard } from "@/components/attendance/timesheet-summary-card";
import { TimesheetTable } from "@/components/attendance/timesheet-table";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { useEmployeeTimesheet } from "@/hooks/use-attendance";

type EmployeeTimesheetPageProps = {
  params: Promise<{ employeeId: string }>;
};

export default function EmployeeTimesheetPage({
  params,
}: EmployeeTimesheetPageProps) {
  const { employeeId } = use(params);
  const { data, isLoading } = useEmployeeTimesheet(employeeId);

  return (
    <PageShell
      title={data?.employeeName ?? "Employee timesheet"}
      description={data?.employeeNo ?? "Loading..."}
      actions={
        <Button
          variant="outline"
          render={<Link href="/attendance/timesheets" />}
        >
          Back
        </Button>
      }
    >
      {isLoading || !data ? (
        <p className="text-muted-foreground">Loading timesheet...</p>
      ) : (
        <>
          <TimesheetSummaryCard
            totalWorkedHours={data.totalWorkedHours}
            totalOvertimeHours={data.totalOvertimeHours}
            presentDays={
              data.days.filter((day) =>
                ["PRESENT", "LATE", "HALF_DAY"].includes(day.status),
              ).length
            }
            periodStart={data.periodStart}
            periodEnd={data.periodEnd}
          />
          <TimesheetTable days={data.days} />
        </>
      )}
    </PageShell>
  );
}
