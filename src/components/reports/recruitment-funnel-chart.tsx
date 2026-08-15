"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ExportToolbar } from "@/components/reports/export-toolbar";
import { ChartContainer } from "@/components/shared/charts/chart-container";
import { ChartTooltip } from "@/components/shared/charts/chart-tooltip";

import type { RecruitmentFunnelReport } from "@/types/reports";

type RecruitmentFunnelChartProps = {
  report?: RecruitmentFunnelReport;
  isLoading?: boolean;
};

export function RecruitmentFunnelChart({
  report,
  isLoading = false,
}: RecruitmentFunnelChartProps) {
  const csvRows =
    report?.stages.map((stage) => ({
      stage: stage.label,
      count: stage.count,
    })) ?? [];

  return (
    <div className="space-y-jk-md">
      <div className="flex justify-end">
        <ExportToolbar
          reportTitle="Recruitment pipeline funnel"
          csvFilename="recruitment-funnel"
          csvColumns={[
            { key: "stage", header: "Stage" },
            { key: "count", header: "Candidates" },
          ]}
          csvRows={csvRows}
          pdfColumns={[
            { header: "Stage", width: 120 },
            { header: "Candidates", width: 70 },
          ]}
          pdfRows={csvRows.map((row) => [String(row.stage), String(row.count)])}
          disabled={isLoading || !report}
        />
      </div>

      <ChartContainer
        title="Pipeline funnel"
        description="Candidates reaching each stage"
        isLoading={isLoading}
        isEmpty={!report || report.stages.every((stage) => stage.count === 0)}
        emptyTitle="No pipeline data"
        emptyDescription="Candidate activity will appear once recruitment records exist."
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={report?.stages ?? []}
            layout="vertical"
            margin={{ left: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={120}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <Tooltip content={<ChartTooltip valueFormat="number" />} />
            <Bar
              dataKey="count"
              name="Candidates"
              fill="var(--chart-1)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
