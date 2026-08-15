"use client";

import { ExportToolbar } from "@/components/reports/export-toolbar";

import type { LeaveUtilizationReport } from "@/types/reports";

type LeaveUtilizationReportViewProps = {
  report?: LeaveUtilizationReport;
  isLoading?: boolean;
};

export function LeaveUtilizationReportView({
  report,
  isLoading = false,
}: LeaveUtilizationReportViewProps) {
  if (isLoading || !report) {
    return <div className="bg-muted/40 h-48 animate-pulse rounded-lg border" />;
  }

  const csvRows = report.byType.map((row) => ({
    type: row.type,
    requests: row.count,
    days: row.days,
  }));

  return (
    <div className="space-y-jk-md">
      <div className="gap-jk-sm flex flex-wrap items-center justify-between">
        <div className="gap-jk-md grid sm:grid-cols-2">
          <div className="px-jk-md py-jk-sm rounded-lg border">
            <p className="text-label-md text-muted-foreground">
              Total requests
            </p>
            <p className="font-heading text-headline-sm">
              {report.totalRequests}
            </p>
          </div>
          <div className="px-jk-md py-jk-sm rounded-lg border">
            <p className="text-label-md text-muted-foreground">Approved days</p>
            <p className="font-heading text-headline-sm">
              {report.approvedDays}
            </p>
          </div>
        </div>
        <ExportToolbar
          reportTitle="Leave utilization report"
          subtitle={report.periodLabel}
          csvFilename="leave-utilization"
          csvColumns={[
            { key: "type", header: "Leave type" },
            { key: "requests", header: "Requests" },
            { key: "days", header: "Days" },
          ]}
          csvRows={csvRows}
          pdfColumns={[
            { header: "Leave type", width: 100 },
            { header: "Requests", width: 70 },
            { header: "Days", width: 60 },
          ]}
          pdfRows={csvRows.map((row) => [
            String(row.type),
            String(row.requests),
            String(row.days),
          ])}
        />
      </div>

      <div className="gap-jk-md grid lg:grid-cols-2">
        <div className="rounded-lg border">
          <div className="bg-muted/40 px-jk-md py-jk-sm border-b font-medium">
            By leave type
          </div>
          <div className="divide-y">
            {report.byType.map((row) => (
              <div
                key={row.type}
                className="px-jk-md py-jk-sm flex items-center justify-between"
              >
                <span>{row.type}</span>
                <span className="text-muted-foreground text-sm">
                  {row.count} requests · {row.days} days
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border">
          <div className="bg-muted/40 px-jk-md py-jk-sm border-b font-medium">
            By status
          </div>
          <div className="divide-y">
            {report.byStatus.map((row) => (
              <div
                key={row.status}
                className="px-jk-md py-jk-sm flex items-center justify-between"
              >
                <span>{row.status}</span>
                <span className="font-medium">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
