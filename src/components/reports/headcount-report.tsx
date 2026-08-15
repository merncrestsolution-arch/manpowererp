"use client";

import { ExportToolbar } from "@/components/reports/export-toolbar";

import type { HeadcountReport } from "@/types/reports";

type HeadcountReportViewProps = {
  report?: HeadcountReport;
  isLoading?: boolean;
};

function GroupTable({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; count: number }[];
}) {
  return (
    <div className="rounded-lg border">
      <div className="bg-muted/40 px-jk-md py-jk-sm border-b font-medium">
        {title}
      </div>
      <div className="divide-y">
        {rows.length === 0 ? (
          <p className="px-jk-md py-jk-sm text-muted-foreground">No data</p>
        ) : (
          rows.map((row) => (
            <div
              key={row.label}
              className="px-jk-md py-jk-sm flex items-center justify-between"
            >
              <span>{row.label}</span>
              <span className="font-medium">{row.count}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function HeadcountReportView({
  report,
  isLoading = false,
}: HeadcountReportViewProps) {
  if (isLoading || !report) {
    return (
      <div className="gap-jk-md grid md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-muted/40 h-48 animate-pulse rounded-lg border"
          />
        ))}
      </div>
    );
  }

  const csvRows = [
    ...report.byDepartment.map((row) => ({
      group: "Department",
      label: row.label,
      count: row.count,
    })),
    ...report.byDesignation.map((row) => ({
      group: "Designation",
      label: row.label,
      count: row.count,
    })),
    ...report.byStatus.map((row) => ({
      group: "Status",
      label: row.label,
      count: row.count,
    })),
  ];

  return (
    <div className="space-y-jk-md">
      <div className="gap-jk-sm flex flex-wrap items-center justify-between">
        <div className="px-jk-md py-jk-sm rounded-lg border">
          <p className="text-label-md text-muted-foreground">Total headcount</p>
          <p className="font-heading text-headline-sm">{report.total}</p>
        </div>
        <ExportToolbar
          reportTitle="Headcount report"
          csvFilename="headcount-report"
          csvColumns={[
            { key: "group", header: "Group" },
            { key: "label", header: "Label" },
            { key: "count", header: "Count" },
          ]}
          csvRows={csvRows}
          pdfColumns={[
            { header: "Group", width: 80 },
            { header: "Label", width: 120 },
            { header: "Count", width: 60 },
          ]}
          pdfRows={csvRows.map((row) => [
            String(row.group),
            String(row.label),
            String(row.count),
          ])}
        />
      </div>

      <div className="gap-jk-md grid lg:grid-cols-3">
        <GroupTable title="By department" rows={report.byDepartment} />
        <GroupTable title="By designation" rows={report.byDesignation} />
        <GroupTable title="By status" rows={report.byStatus} />
      </div>
    </div>
  );
}
