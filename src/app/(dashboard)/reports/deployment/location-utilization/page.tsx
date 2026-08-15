"use client";

import Link from "next/link";
import { useState } from "react";

import { DeploymentUtilizationReportView } from "@/components/reports/deployment-utilization-report";
import { ReportsHubNav } from "@/components/reports/reports-hub-nav";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { useDeploymentUtilizationReport } from "@/hooks/use-reports";
import { getDefaultMonthDateRange } from "@/lib/finance-dates";

const deploymentLinks = [
  {
    label: "Active deployments",
    href: "/reports/deployment/active-deployments",
  },
  {
    label: "Location utilization",
    href: "/reports/deployment/location-utilization",
  },
];

export default function LocationUtilizationReportPage() {
  const [filters, setFilters] = useState(getDefaultMonthDateRange);
  const { data, isLoading } = useDeploymentUtilizationReport(filters);

  return (
    <PageShell
      title="Location utilization"
      description="Active worker counts per work location and client"
      actions={
        <Button variant="outline" render={<Link href="/reports" />}>
          Back to reports
        </Button>
      }
    >
      <ReportsHubNav items={deploymentLinks} />

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              dateFrom: event.target.value,
            }))
          }
          className="border-input bg-background h-9 rounded-lg border px-3 text-sm"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              dateTo: event.target.value,
            }))
          }
          className="border-input bg-background h-9 rounded-lg border px-3 text-sm"
        />
      </div>

      <DeploymentUtilizationReportView report={data} isLoading={isLoading} />
    </PageShell>
  );
}
