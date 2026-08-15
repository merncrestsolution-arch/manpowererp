"use client";

import Link from "next/link";
import { useState } from "react";

import { PageShell } from "@/components/shared/page-shell";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useTimesheetSummaries } from "@/hooks/use-attendance";
import { getColomboDateKey } from "@/lib/date";

export default function TimesheetsPage() {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const { data, isLoading } = useTimesheetSummaries(period);

  return (
    <PageShell
      title="Timesheets"
      description="Review worked hours and overtime by employee."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Select
            className="h-9 w-[160px]"
            value={period}
            onChange={(event) =>
              setPeriod(event.target.value as "week" | "month")
            }
          >
            <option value="week">This week</option>
            <option value="month">This month</option>
          </Select>
          <Button variant="outline" render={<Link href="/attendance" />}>
            Back
          </Button>
        </div>
      }
    >
      <SectionCard
        title="Employee summaries"
        description={`Period: ${data?.periodStart ?? getColomboDateKey()} – ${data?.periodEnd ?? getColomboDateKey()}`}
      >
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading timesheets…</p>
        ) : (data?.items ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No timesheet records for this period.
          </p>
        ) : (
          <div className="space-y-2">
            {(data?.items ?? []).map((item) => (
              <div
                key={item.employeeId}
                className="border-border flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3"
              >
                <div>
                  <p className="font-medium">{item.employeeName}</p>
                  <p className="text-muted-foreground text-sm">
                    {item.employeeNo} · {item.presentDays} present days
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <p>{item.totalWorkedHours}h worked</p>
                    <p className="text-muted-foreground">
                      {item.totalOvertimeHours}h overtime
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <Link
                        href={`/attendance/timesheets/${item.employeeId}`}
                      />
                    }
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
