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
import { ChartTooltip } from "@/components/shared/charts/chart-tooltip";
import { usePayrollSummaryReport } from "@/hooks/use-payroll";

type PayrollTrendChartProps = {
  periodId?: string;
};

export function PayrollTrendChart({ periodId }: PayrollTrendChartProps) {
  const { data, isLoading } = usePayrollSummaryReport(periodId);

  return (
    <ChartContainer
      title="Payroll cost trend"
      description="Gross and net payroll across recent periods"
      isLoading={isLoading}
      isEmpty={!data?.trend.length}
      emptyTitle="No payroll trend data"
      emptyDescription="Finalize payslips across periods to see trends."
    >
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data?.trend ?? []}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
            <XAxis dataKey="periodLabel" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              content={<ChartTooltip valueFormat="currency" currency="LKR" />}
            />
            <Bar
              dataKey="gross"
              name="Gross"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="net"
              name="Net"
              fill="hsl(var(--chart-2))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}
