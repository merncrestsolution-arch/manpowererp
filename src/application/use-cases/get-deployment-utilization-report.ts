import { eachWeekOfInterval, endOfWeek, format } from "date-fns";

import { prisma } from "@/infrastructure/db/prisma";
import { formatPeriodLabel, getReportDateRange } from "@/lib/finance-dates";

import type { DeploymentUtilizationReport } from "@/types/reports";

type GetDeploymentUtilizationParams = {
  branchId: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function getDeploymentUtilizationReport({
  branchId,
  dateFrom,
  dateTo,
}: GetDeploymentUtilizationParams): Promise<DeploymentUtilizationReport> {
  const range =
    dateFrom && dateTo ? getReportDateRange(dateFrom, dateTo) : null;

  const [activeDeployments, allDeployments] = await Promise.all([
    prisma.deployment.findMany({
      where: {
        branchId,
        deletedAt: null,
        status: "ACTIVE",
      },
      select: {
        clientId: true,
        workLocationId: true,
        client: { select: { companyName: true } },
        workLocation: { select: { name: true } },
      },
    }),
    range
      ? prisma.deployment.findMany({
          where: {
            branchId,
            deletedAt: null,
            startDate: { lte: range.to },
            OR: [{ endDate: null }, { endDate: { gte: range.from } }],
          },
          select: {
            status: true,
            startDate: true,
            endDate: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const clientCounts = new Map<string, { name: string; count: number }>();
  for (const deployment of activeDeployments) {
    const entry = clientCounts.get(deployment.clientId) ?? {
      name: deployment.client.companyName,
      count: 0,
    };
    entry.count += 1;
    clientCounts.set(deployment.clientId, entry);
  }

  const locationCounts = new Map<
    string,
    { name: string; clientName: string; count: number }
  >();
  for (const deployment of activeDeployments) {
    const entry = locationCounts.get(deployment.workLocationId) ?? {
      name: deployment.workLocation.name,
      clientName: deployment.client.companyName,
      count: 0,
    };
    entry.count += 1;
    locationCounts.set(deployment.workLocationId, entry);
  }

  let availabilityTrend: DeploymentUtilizationReport["availabilityTrend"] = [];

  if (range) {
    const weeks = eachWeekOfInterval(
      { start: range.from, end: range.to },
      { weekStartsOn: 1 },
    );

    availabilityTrend = weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      let active = 0;
      let scheduled = 0;

      for (const deployment of allDeployments) {
        const started = deployment.startDate <= weekEnd;
        const notEnded = !deployment.endDate || deployment.endDate >= weekStart;

        if (!started || !notEnded) {
          continue;
        }

        if (deployment.status === "ACTIVE") {
          active += 1;
        } else if (deployment.status === "SCHEDULED") {
          scheduled += 1;
        }
      }

      return {
        date: format(weekStart, "yyyy-MM-dd"),
        active,
        scheduled,
      };
    });
  }

  return {
    activeByClient: Array.from(clientCounts.entries())
      .map(([clientId, value]) => ({
        clientId,
        clientName: value.name,
        activeCount: value.count,
      }))
      .sort((a, b) => b.activeCount - a.activeCount),
    locationUtilization: Array.from(locationCounts.entries())
      .map(([locationId, value]) => ({
        locationId,
        locationName: value.name,
        clientName: value.clientName,
        activeCount: value.count,
      }))
      .sort((a, b) => b.activeCount - a.activeCount),
    availabilityTrend,
    ...(range && dateFrom && dateTo
      ? { periodLabel: formatPeriodLabel(dateFrom, dateTo) }
      : {}),
  };
}
