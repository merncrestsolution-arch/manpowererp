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

import { ChartContainer } from "@/components/shared/charts/chart-container";
import { ChartTooltip } from "@/components/shared/charts/chart-tooltip";

import type { ProfitAndLossReport } from "@/types/finance";

type ProfitAndLossChartProps = {
  report?: ProfitAndLossReport;
  isLoading?: boolean;
};

export function ProfitAndLossChart({
  report,
  isLoading = false,
}: ProfitAndLossChartProps) {
  const chartData = report
    ? [
        {
          metric: "Revenue",
          current: report.totalRevenue,
          previous: report.previousTotalRevenue,
        },
        {
          metric: "Expenses",
          current: report.totalExpenses,
          previous: report.previousTotalExpenses,
        },
        {
          metric: "Net profit",
          current: report.netProfit,
          previous: report.previousNetProfit,
        },
      ]
    : [];

  const isEmpty =
    !report ||
    (report.totalRevenue === 0 &&
      report.totalExpenses === 0 &&
      report.previousTotalRevenue === 0 &&
      report.previousTotalExpenses === 0);

  return (
    <ChartContainer
      title="Period comparison"
      description={`${report?.periodLabel ?? ""} vs ${report?.previousPeriodLabel ?? ""}`}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyTitle="No profit and loss data"
      emptyDescription="Revenue and expense entries will appear once journals are posted."
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            strokeOpacity={0.6}
            vertical={false}
          />
          <XAxis
            dataKey="metric"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(value: number) =>
              value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value)
            }
          />
          <Tooltip
            content={
              <ChartTooltip
                valueFormat="currency"
                currency={report?.currency ?? "LKR"}
              />
            }
          />
          <Legend />
          <Bar
            dataKey="current"
            name="Current period"
            fill="var(--chart-1)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="previous"
            name="Previous period"
            fill="var(--chart-3)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
