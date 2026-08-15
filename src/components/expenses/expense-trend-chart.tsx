"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer } from "@/components/shared/charts/chart-container";
import { ChartTooltip } from "@/components/shared/charts/chart-tooltip";

import type { ExpenseReportSummary } from "@/types/expense";

type ExpenseTrendChartProps = {
  report?: ExpenseReportSummary;
  isLoading?: boolean;
};

export function ExpenseTrendChart({
  report,
  isLoading = false,
}: ExpenseTrendChartProps) {
  const data = report?.trend ?? [];
  const isEmpty = data.length === 0;

  return (
    <ChartContainer
      title="Expense Trend"
      description={report?.periodLabel}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyTitle="No trend data yet"
      emptyDescription="Monthly expense trends will appear once records are added."
      className="h-full"
    >
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id="expenseTrendGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            strokeOpacity={0.6}
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={48}
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
          <Area
            type="monotone"
            dataKey="value"
            name="Expenses"
            stroke="var(--chart-2)"
            strokeWidth={2}
            fill="url(#expenseTrendGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--chart-2)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
