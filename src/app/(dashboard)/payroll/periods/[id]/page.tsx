"use client";

import Link from "next/link";
import { use } from "react";

import { PayrollPeriodStatusBadge } from "@/components/payroll/payroll-period-status-badge";
import { PayslipTable } from "@/components/payroll/payslip-table";
import { RunPayrollDialog } from "@/components/payroll/run-payroll-dialog";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePayrollPeriod } from "@/hooks/use-payroll";
import { formatColomboDate } from "@/lib/date";
import { formatCurrency } from "@/lib/format";

type PayrollPeriodDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function PayrollPeriodDetailPage({
  params,
}: PayrollPeriodDetailPageProps) {
  const { id } = use(params);
  const { data: period, isLoading } = usePayrollPeriod(id);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading payroll period...</p>;
  }

  if (!period) {
    return <p className="text-destructive">Payroll period not found.</p>;
  }

  const periodLabel = `${formatColomboDate(new Date(period.periodStart))} – ${formatColomboDate(new Date(period.periodEnd))}`;

  return (
    <PageShell
      title="Payroll period"
      description={periodLabel}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            render={<Link href={`/payroll/periods/${id}/run`} />}
          >
            Run flow
          </Button>
          <RunPayrollDialog periodId={id} periodLabel={periodLabel} />
          <Button variant="outline" render={<Link href="/payroll" />}>
            Back
          </Button>
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <PayrollPeriodStatusBadge status={period.status} />
        <p className="text-body-md text-muted-foreground">
          Pay date: {formatColomboDate(new Date(period.payDate))}
        </p>
      </div>

      <div className="gap-jk-md grid sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Payslips", value: String(period.payslipCount) },
          { label: "Draft", value: String(period.draftCount) },
          { label: "Finalized", value: String(period.finalizedCount) },
          { label: "Total net", value: formatCurrency(period.totalNet) },
        ].map((metric) => (
          <Card key={metric.label} className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-muted-foreground font-normal">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-headline-lg-mobile">
                {metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-jk-md">
        <h2 className="font-heading text-title-lg">Payslips</h2>
        <PayslipTable payrollPeriodId={id} />
      </div>
    </PageShell>
  );
}
