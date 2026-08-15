"use client";

import {
  Bar,
  BarChart,
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

import type { DeploymentUtilizationReport } from "@/types/reports";

type DeploymentUtilizationReportViewProps = {
  report?: DeploymentUtilizationReport;
  isLoading?: boolean;
};

export function DeploymentUtilizationReportView({
  report,
  isLoading = false,
}: DeploymentUtilizationReportViewProps) {
  if (isLoading || !report) {
    return <div className="bg-muted/40 h-64 animate-pulse rounded-lg border" />;
  }

  const clientRows = report.activeByClient.map((row) => ({
    client: row.clientName,
    active: row.activeCount,
  }));

  return (
    <div className="space-y-jk-md">
      <div className="flex justify-end">
        <ExportToolbar
          reportTitle="Deployment utilization"
          subtitle={report.periodLabel}
          csvFilename="deployment-utilization"
          csvColumns={[
            { key: "client", header: "Client" },
            { key: "active", header: "Active deployments" },
          ]}
          csvRows={clientRows}
          pdfColumns={[
            { header: "Client", width: 120 },
            { header: "Active", width: 60 },
          ]}
          pdfRows={clientRows.map((row) => [
            String(row.client),
            String(row.active),
          ])}
        />
      </div>

      <div className="gap-jk-md grid lg:grid-cols-2">
        <div className="rounded-lg border">
          <div className="bg-muted/40 px-jk-md py-jk-sm border-b font-medium">
            Active deployments by client
          </div>
          <div className="divide-y">
            {report.activeByClient.length === 0 ? (
              <p className="px-jk-md py-jk-sm text-muted-foreground">
                No active deployments
              </p>
            ) : (
              report.activeByClient.map((row) => (
                <div
                  key={row.clientId}
                  className="px-jk-md py-jk-sm flex items-center justify-between"
                >
                  <span>{row.clientName}</span>
                  <span className="font-medium">{row.activeCount}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="bg-muted/40 px-jk-md py-jk-sm border-b font-medium">
            Work location utilization
          </div>
          <div className="divide-y">
            {report.locationUtilization.length === 0 ? (
              <p className="px-jk-md py-jk-sm text-muted-foreground">
                No location data
              </p>
            ) : (
              report.locationUtilization.map((row) => (
                <div
                  key={row.locationId}
                  className="px-jk-md py-jk-sm flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{row.locationName}</p>
                    <p className="text-muted-foreground text-sm">
                      {row.clientName}
                    </p>
                  </div>
                  <span className="font-medium">{row.activeCount}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ChartContainer
        title="Availability trend"
        description={report.periodLabel ?? "Weekly active vs scheduled"}
        isEmpty={report.availabilityTrend.length === 0}
        emptyTitle="No trend data"
        emptyDescription="Select a date range to view deployment availability."
      >
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={report.availabilityTrend}>
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
              dataKey="active"
              name="Active"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="scheduled"
              name="Scheduled"
              stroke="var(--chart-3)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer
        title="Active by client"
        isEmpty={clientRows.length === 0}
        emptyTitle="No client data"
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={clientRows}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="client"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
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
            <Bar
              dataKey="active"
              name="Active"
              fill="var(--chart-1)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
