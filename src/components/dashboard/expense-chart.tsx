"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer } from "@/components/shared/charts/chart-container";
import { ChartTooltip } from "@/components/shared/charts/chart-tooltip";
import { getChartColor } from "@/lib/chart-colors";

import type { ChartDataPoint } from "@/types/dashboard";

type ExpenseChartProps = {
  data: ChartDataPoint[];
  periodLabel?: string;
  isLoading?: boolean;
  currency?: string;
};

export function ExpenseChart({
  data,
  periodLabel,
  isLoading = false,
  currency = "LKR",
}: ExpenseChartProps) {
  const isEmpty = data.length === 0;

  return (
    <ChartContainer
      title="Expense Breakdown"
      description={periodLabel}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyTitle="No expense data yet"
      emptyDescription="Expenses by category will appear once records are added."
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 12, left: 4, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            strokeOpacity={0.6}
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) =>
              value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value)
            }
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={92}
            tickFormatter={(value: string) =>
              value.length > 12 ? `${value.slice(0, 12)}…` : value
            }
          />
          <Tooltip
            content={
              <ChartTooltip valueFormat="currency" currency={currency} />
            }
          />
          <Bar dataKey="value" name="Amount" radius={[0, 4, 4, 0]} barSize={18}>
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={getChartColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
