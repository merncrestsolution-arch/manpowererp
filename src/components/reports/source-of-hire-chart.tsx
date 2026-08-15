"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ExportToolbar } from "@/components/reports/export-toolbar";
import { ChartContainer } from "@/components/shared/charts/chart-container";
import { ChartTooltip } from "@/components/shared/charts/chart-tooltip";

import type { RecruitmentFunnelReport } from "@/types/reports";

type SourceOfHireChartProps = {
  report?: RecruitmentFunnelReport;
  isLoading?: boolean;
};

export function SourceOfHireChart({
  report,
  isLoading = false,
}: SourceOfHireChartProps) {
  const csvRows =
    report?.sourceOfHire.map((row) => ({
      source: row.label,
      total: row.total,
      placed: row.placed,
    })) ?? [];

  return (
    <div className="space-y-jk-md">
      <div className="flex justify-end">
        <ExportToolbar
          reportTitle="Source of hire"
          csvFilename="source-of-hire"
          csvColumns={[
            { key: "source", header: "Source" },
            { key: "total", header: "Total candidates" },
            { key: "placed", header: "Placed" },
          ]}
          csvRows={csvRows}
          pdfColumns={[
            { header: "Source", width: 90 },
            { header: "Total", width: 60 },
            { header: "Placed", width: 60 },
          ]}
          pdfRows={csvRows.map((row) => [
            String(row.source),
            String(row.total),
            String(row.placed),
          ])}
          disabled={isLoading || !report}
        />
      </div>

      <ChartContainer
        title="Source of hire"
        description="Candidates and placements by source"
        isLoading={isLoading}
        isEmpty={!report || report.sourceOfHire.length === 0}
        emptyTitle="No source data"
        emptyDescription="Source breakdown will appear once candidates are added."
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={report?.sourceOfHire ?? []}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
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
            <Bar
              dataKey="total"
              name="Total"
              fill="var(--chart-3)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="placed"
              name="Placed"
              fill="var(--chart-1)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
