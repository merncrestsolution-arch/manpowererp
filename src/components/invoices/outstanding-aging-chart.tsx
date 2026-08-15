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

import { ChartContainer } from "@/components/shared/charts/chart-container";
import { formatCurrency } from "@/lib/format";

import type { OutstandingReport } from "@/types/invoice";

type OutstandingAgingChartProps = {
  report?: OutstandingReport;
  isLoading?: boolean;
};

export function OutstandingAgingChart({
  report,
  isLoading = false,
}: OutstandingAgingChartProps) {
  const isEmpty = !report || report.totals.totalOutstanding === 0;

  return (
    <ChartContainer
      title="Aging distribution"
      description="Outstanding balances by days overdue"
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyTitle="No outstanding invoices"
      emptyDescription="All invoices are paid or no sent invoices exist yet."
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={report?.chartData ?? []}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) =>
              formatCurrency(Number(value ?? 0), report?.currency ?? "LKR")
            }
          />
          <Bar
            dataKey="value"
            fill="var(--color-jk-primary)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
