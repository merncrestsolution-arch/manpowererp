"use client";

import { PayrollTrendChart } from "@/components/payroll/payroll-trend-chart";
import { ExportToolbar } from "@/components/reports/export-toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePayrollSummaryReport } from "@/hooks/use-payroll";
import { formatCurrency } from "@/lib/format";

type PayrollSummaryReportProps = {
  periodId?: string;
};

export function PayrollSummaryReport({ periodId }: PayrollSummaryReportProps) {
  const { data, isLoading } = usePayrollSummaryReport(periodId);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading report...</p>;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-jk-lg">
      <ExportToolbar
        reportTitle="Payroll summary"
        subtitle={data.periodLabel}
        csvFilename="payroll-summary.csv"
        csvColumns={[
          { key: "department", header: "Department" },
          { key: "employees", header: "Employees" },
          { key: "gross", header: "Gross" },
          { key: "net", header: "Net" },
        ]}
        csvRows={data.byDepartment.map((row) => ({
          department: row.department,
          employees: row.count,
          gross: formatCurrency(row.gross),
          net: formatCurrency(row.net),
        }))}
        pdfColumns={[
          { header: "Department", width: 180 },
          { header: "Employees", width: 90 },
          { header: "Gross", width: 120 },
          { header: "Net", width: 120 },
        ]}
        pdfRows={data.byDepartment.map((row) => [
          row.department,
          String(row.count),
          formatCurrency(row.gross),
          formatCurrency(row.net),
        ])}
      />
      <div className="gap-jk-md grid sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total gross", value: data.totalGross },
          { label: "Total net", value: data.totalNet },
          { label: "Total deductions", value: data.totalDeductions },
          { label: "Total overtime", value: data.totalOvertime },
        ].map((metric) => (
          <Card key={metric.label} className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-label-md text-muted-foreground font-normal">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-headline-lg-mobile">
                {formatCurrency(metric.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-heading text-title-lg">
            By department — {data.periodLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-jk-sm">
          {data.byDepartment.length ? (
            data.byDepartment.map((row) => (
              <div
                key={row.department}
                className="px-jk-md py-jk-sm flex items-center justify-between rounded-lg border"
              >
                <div>
                  <p className="font-medium">{row.department}</p>
                  <p className="text-label-md text-muted-foreground">
                    {row.count} employees
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(row.net)}</p>
                  <p className="text-label-md text-muted-foreground">
                    Gross {formatCurrency(row.gross)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">
              No finalized payslips for this period.
            </p>
          )}
        </CardContent>
      </Card>

      <PayrollTrendChart periodId={periodId} />
    </div>
  );
}
