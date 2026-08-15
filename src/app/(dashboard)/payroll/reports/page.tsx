"use client";

import Link from "next/link";
import { useState } from "react";

import { PayrollSummaryReport } from "@/components/payroll/payroll-summary-report";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { usePayrollPeriods } from "@/hooks/use-payroll";

export default function PayrollReportsPage() {
  const { data } = usePayrollPeriods({
    page: 1,
    pageSize: 50,
    sortBy: "periodStart",
    sortOrder: "desc",
  });
  const [periodId, setPeriodId] = useState<string | undefined>();

  const selectedPeriodId = periodId ?? data?.items[0]?.id;

  return (
    <PageShell
      title="Payroll reports"
      description="Summary totals and payroll cost trends"
      actions={
        <Button variant="outline" render={<Link href="/payroll" />}>
          Back to payroll
        </Button>
      }
    >
      <div className="space-y-jk-sm max-w-sm">
        <label className="text-label-md text-muted-foreground" htmlFor="period">
          Payroll period
        </label>
        <Select
          id="period"
          value={selectedPeriodId ?? ""}
          onChange={(event) => setPeriodId(event.target.value)}
        >
          {data?.items.map((period) => (
            <option key={period.id} value={period.id}>
              {new Date(period.periodStart).toLocaleDateString("en-LK")} –{" "}
              {new Date(period.periodEnd).toLocaleDateString("en-LK")}
            </option>
          ))}
        </Select>
      </div>

      <PayrollSummaryReport periodId={selectedPeriodId} />
    </PageShell>
  );
}
