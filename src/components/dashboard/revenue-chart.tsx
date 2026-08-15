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

import type { ChartDataPoint } from "@/types/dashboard";

type RevenueChartProps = {
  data: ChartDataPoint[];
  periodLabel?: string;
  isLoading?: boolean;
  currency?: string;
};

export function RevenueChart({
  data,
  periodLabel,
  isLoading = false,
  currency = "LKR",
}: RevenueChartProps) {
  const isEmpty = data.length === 0;

  return (
    <ChartContainer
      title="Revenue Trend"
      description={periodLabel}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyTitle="No revenue data yet"
      emptyDescription="Monthly revenue trends will appear once invoices are recorded."
    >
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
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
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={22}
            dy={6}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(value: number) =>
              value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value)
            }
          />
          <Tooltip
            content={
              <ChartTooltip valueFormat="currency" currency={currency} />
            }
          />
          <Area
            type="monotone"
            dataKey="value"
            name="Revenue"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--chart-1)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
