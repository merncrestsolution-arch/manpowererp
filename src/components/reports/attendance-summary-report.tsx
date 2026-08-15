"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ExportToolbar } from "@/components/reports/export-toolbar";
import { ChartContainer } from "@/components/shared/charts/chart-container";
import { ChartTooltip } from "@/components/shared/charts/chart-tooltip";

import type { AttendanceSummaryReport } from "@/types/reports";

type AttendanceSummaryReportViewProps = {
  report?: AttendanceSummaryReport;
  isLoading?: boolean;
};

export function AttendanceSummaryReportView({
  report,
  isLoading = false,
}: AttendanceSummaryReportViewProps) {
  if (isLoading || !report) {
    return <div className="bg-muted/40 h-64 animate-pulse rounded-lg border" />;
  }

  const csvRows = report.trend.map((point) => ({
    date: point.date,
    present: point.present,
    late: point.late,
    absent: point.absent,
    onLeave: point.onLeave,
  }));

  return (
    <div className="space-y-jk-md">
      <div className="gap-jk-sm flex flex-wrap items-center justify-between">
        <div className="gap-jk-md grid sm:grid-cols-3 xl:grid-cols-5">
          {[
            { label: "Present", value: report.totals.present },
            { label: "Late", value: report.totals.late },
            { label: "Absent", value: report.totals.absent },
            { label: "Half day", value: report.totals.halfDay },
            { label: "On leave", value: report.totals.onLeave },
          ].map((metric) => (
            <div
              key={metric.label}
              className="px-jk-md py-jk-sm rounded-lg border"
            >
              <p className="text-label-md text-muted-foreground">
                {metric.label}
              </p>
              <p className="font-heading text-headline-sm">{metric.value}</p>
            </div>
          ))}
        </div>
        <ExportToolbar
          reportTitle="Attendance summary"
          subtitle={report.periodLabel}
          csvFilename="attendance-summary"
          csvColumns={[
            { key: "date", header: "Date" },
            { key: "present", header: "Present" },
            { key: "late", header: "Late" },
            { key: "absent", header: "Absent" },
            { key: "onLeave", header: "On leave" },
          ]}
          csvRows={csvRows}
          pdfColumns={[
            { header: "Date", width: 70 },
            { header: "Present", width: 50 },
            { header: "Late", width: 40 },
            { header: "Absent", width: 50 },
            { header: "On leave", width: 50 },
          ]}
          pdfRows={csvRows.map((row) => [
            String(row.date),
            String(row.present),
            String(row.late),
            String(row.absent),
            String(row.onLeave),
          ])}
        />
      </div>

      <ChartContainer
        title="Attendance trend"
        description={report.periodLabel}
        isEmpty={report.trend.length === 0}
        emptyTitle="No attendance records"
        emptyDescription="Attendance data will appear once records are captured."
      >
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={report.trend}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<ChartTooltip valueFormat="number" />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="present"
              name="Present"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="late"
              name="Late"
              stroke="var(--chart-3)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="absent"
              name="Absent"
              stroke="var(--chart-5)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
