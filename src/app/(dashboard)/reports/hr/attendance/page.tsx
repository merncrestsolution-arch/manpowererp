"use client";

import Link from "next/link";
import { useState } from "react";

import { AttendanceSummaryReportView } from "@/components/reports/attendance-summary-report";
import { ReportsHubNav } from "@/components/reports/reports-hub-nav";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { useAttendanceSummaryReport } from "@/hooks/use-reports";
import { getDefaultMonthDateRange } from "@/lib/finance-dates";

const hrLinks = [
  { label: "Headcount", href: "/reports/hr/headcount" },
  { label: "Attendance", href: "/reports/hr/attendance" },
  { label: "Leave", href: "/reports/hr/leave" },
];

export default function AttendanceReportPage() {
  const [filters, setFilters] = useState(getDefaultMonthDateRange);
  const { data, isLoading } = useAttendanceSummaryReport(filters);

  return (
    <PageShell
      title="Attendance summary"
      description="Attendance trends and status totals for the selected period"
      actions={
        <Button variant="outline" render={<Link href="/reports" />}>
          Back to reports
        </Button>
      }
    >
      <ReportsHubNav items={hrLinks} />

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              dateFrom: event.target.value,
            }))
          }
          className="border-input bg-background h-9 rounded-lg border px-3 text-sm"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              dateTo: event.target.value,
            }))
          }
          className="border-input bg-background h-9 rounded-lg border px-3 text-sm"
        />
      </div>

      <AttendanceSummaryReportView report={data} isLoading={isLoading} />
    </PageShell>
  );
}
