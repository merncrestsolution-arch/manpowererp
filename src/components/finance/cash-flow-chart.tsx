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
import { formatCurrency } from "@/lib/format";

import type { CashFlowReport } from "@/types/finance";

type CashFlowChartProps = {
  report?: CashFlowReport;
  isLoading?: boolean;
};

export function CashFlowChart({
  report,
  isLoading = false,
}: CashFlowChartProps) {
  const data = report?.chartData ?? [];
  const isEmpty = data.length === 0;

  return (
    <div className="space-y-jk-md">
      {report ? (
        <ExportToolbar
          reportTitle="Cash flow"
          subtitle={report.periodLabel}
          csvFilename="cash-flow.csv"
          csvColumns={[
            { key: "source", header: "Source" },
            { key: "inflow", header: "Inflow" },
            { key: "outflow", header: "Outflow" },
            { key: "net", header: "Net" },
          ]}
          csvRows={report.groups.map((group) => ({
            source: group.label,
            inflow: formatCurrency(group.inflow, report.currency),
            outflow: formatCurrency(group.outflow, report.currency),
            net: formatCurrency(group.net, report.currency),
          }))}
          pdfColumns={[
            { header: "Source", width: 160 },
            { header: "Inflow", width: 110 },
            { header: "Outflow", width: 110 },
            { header: "Net", width: 110 },
          ]}
          pdfRows={report.groups.map((group) => [
            group.label,
            formatCurrency(group.inflow, report.currency),
            formatCurrency(group.outflow, report.currency),
            formatCurrency(group.net, report.currency),
          ])}
        />
      ) : null}

      {report ? (
        <div className="gap-jk-md grid md:grid-cols-3">
          <div className="px-jk-md py-jk-sm rounded-lg border">
            <p className="text-label-md text-muted-foreground">Total inflow</p>
            <p className="font-heading text-headline-sm text-success">
              {formatCurrency(report.totalInflow, report.currency)}
            </p>
          </div>
          <div className="px-jk-md py-jk-sm rounded-lg border">
            <p className="text-label-md text-muted-foreground">Total outflow</p>
            <p className="font-heading text-headline-sm text-destructive">
              {formatCurrency(report.totalOutflow, report.currency)}
            </p>
          </div>
          <div className="px-jk-md py-jk-sm rounded-lg border">
            <p className="text-label-md text-muted-foreground">Net cash flow</p>
            <p className="font-heading text-headline-sm">
              {formatCurrency(report.netCashFlow, report.currency)}
            </p>
          </div>
        </div>
      ) : null}

      <ChartContainer
        title="Cash flow by source"
        description={report?.periodLabel}
        isLoading={isLoading}
        isEmpty={isEmpty}
        emptyTitle="No cash flow data"
        emptyDescription="Cash movements will appear once transactions are posted."
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
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
              dataKey="inflow"
              name="Inflow"
              fill="var(--chart-1)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="outflow"
              name="Outflow"
              fill="var(--chart-5)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
