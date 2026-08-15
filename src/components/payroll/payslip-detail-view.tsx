"use client";

import { Download, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PayslipStatusBadge } from "@/components/payroll/payroll-period-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { finalizePayslipById, usePayslip } from "@/hooks/use-payroll";
import { formatColomboDate } from "@/lib/date";
import { formatCurrency } from "@/lib/format";

type PayslipDetailViewProps = {
  payslipId: string;
};

export function PayslipDetailView({ payslipId }: PayslipDetailViewProps) {
  const router = useRouter();
  const { data: payslip, isLoading, refetch } = usePayslip(payslipId);
  const [finalizing, setFinalizing] = useState(false);

  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      await finalizePayslipById(payslipId);
      await refetch();
      router.refresh();
    } finally {
      setFinalizing(false);
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Loading payslip...</p>;
  }

  if (!payslip) {
    return <p className="text-destructive">Payslip not found.</p>;
  }

  const earnings = payslip.lineItems.filter(
    (item) =>
      item.type === "BASIC" ||
      item.type === "ALLOWANCE" ||
      item.type === "OVERTIME",
  );
  const deductions = payslip.lineItems.filter(
    (item) => item.type === "DEDUCTION",
  );

  return (
    <div className="max-w-container gap-jk-lg mx-auto flex flex-col">
      <div className="gap-jk-md flex flex-wrap items-start justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-headline-md">
              {payslip.payslipNo}
            </h1>
            <PayslipStatusBadge status={payslip.status} />
          </div>
          <p className="text-body-md text-muted-foreground">
            {payslip.employeeName} ({payslip.employeeNo})
          </p>
          <p className="text-body-md text-muted-foreground">
            {formatColomboDate(new Date(payslip.periodStart))} –{" "}
            {formatColomboDate(new Date(payslip.periodEnd))}
          </p>
        </div>
        <div className="gap-jk-sm flex flex-wrap">
          {payslip.status === "DRAFT" ? (
            <Button onClick={handleFinalize} disabled={finalizing}>
              <Lock className="size-4" />
              {finalizing ? "Finalizing..." : "Finalize"}
            </Button>
          ) : null}
          {payslip.status !== "DRAFT" ? (
            <Button
              variant="outline"
              render={
                <a href={`/api/payroll/payslips/${payslip.id}/pdf`} download />
              }
            >
              <Download className="size-4" />
              Download PDF
            </Button>
          ) : null}
          <Button
            variant="outline"
            render={
              <Link href={`/payroll/periods/${payslip.payrollPeriodId}`} />
            }
          >
            Back to period
          </Button>
        </div>
      </div>

      <div className="gap-jk-md grid lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-title-lg">
              Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-jk-sm">
            {earnings.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span>{item.label}</span>
                <span className="font-medium">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
            <div className="pt-jk-sm flex items-center justify-between border-t font-medium">
              <span>Gross salary</span>
              <span>{formatCurrency(payslip.grossSalary)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-title-lg">
              Deductions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-jk-sm">
            {deductions.length ? (
              deductions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{item.label}</span>
                  <span className="font-medium">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No deductions</p>
            )}
            <div className="pt-jk-sm flex items-center justify-between border-t font-medium">
              <span>Total deductions</span>
              <span>{formatCurrency(payslip.totalDeductions)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-jk-primary-container/30 bg-jk-primary-container/10 shadow-card">
        <CardContent className="py-jk-lg flex items-center justify-between">
          <div>
            <p className="text-label-md text-muted-foreground">Net pay</p>
            <p className="font-heading text-headline-lg-mobile text-jk-primary-container">
              {formatCurrency(payslip.netSalary)}
            </p>
          </div>
          <p className="text-body-md text-muted-foreground">
            Pay date: {formatColomboDate(new Date(payslip.payDate))}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
