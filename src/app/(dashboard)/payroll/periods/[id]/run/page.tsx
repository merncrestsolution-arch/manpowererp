"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

import { RunPayrollDialog } from "@/components/payroll/run-payroll-dialog";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePayrollPeriod, usePayslips } from "@/hooks/use-payroll";
import { formatColomboDate } from "@/lib/date";

type RunPayrollPageProps = {
  params: Promise<{ id: string }>;
};

export default function RunPayrollPage({ params }: RunPayrollPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: period } = usePayrollPeriod(id);
  const { data: payslips } = usePayslips({ payrollPeriodId: id, pageSize: 1 });
  const [confirmed, setConfirmed] = useState(false);

  if (!period) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  const periodLabel = `${formatColomboDate(new Date(period.periodStart))} – ${formatColomboDate(new Date(period.periodEnd))}`;
  const existingCount = payslips?.total ?? 0;

  return (
    <PageShell
      title="Run payroll"
      description={`Review the summary before generating draft payslips for ${periodLabel}.`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {!confirmed ? (
            <Button onClick={() => setConfirmed(true)}>Continue</Button>
          ) : (
            <RunPayrollDialog periodId={id} periodLabel={periodLabel} />
          )}
          <Button
            variant="outline"
            onClick={() => router.push(`/payroll/periods/${id}`)}
          >
            Back to period
          </Button>
          <Button variant="ghost" render={<Link href="/payroll" />}>
            Cancel
          </Button>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-2xl">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-title-lg">
              Confirmation summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-jk-sm text-body-md">
            <p>Pay date: {formatColomboDate(new Date(period.payDate))}</p>
            <p>Existing payslips in this period: {existingCount}</p>
            <p>
              Running payroll will generate draft payslips for all active
              employees with a configured basic salary, including approved
              overtime from attendance.
            </p>
            {existingCount > 0 ? (
              <p className="text-amber-700 dark:text-amber-400">
                Draft payslips will be regenerated; finalized payslips are left
                unchanged.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
