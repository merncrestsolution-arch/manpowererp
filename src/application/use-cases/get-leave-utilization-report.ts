import { differenceInCalendarDays } from "date-fns";

import { prisma } from "@/infrastructure/db/prisma";
import { formatPeriodLabel, getReportDateRange } from "@/lib/finance-dates";

import type { LeaveUtilizationReport } from "@/types/reports";

type GetLeaveUtilizationParams = {
  branchId: string;
  dateFrom?: string;
  dateTo?: string;
};

function countLeaveDays(startDate: Date, endDate: Date): number {
  return differenceInCalendarDays(endDate, startDate) + 1;
}

export async function getLeaveUtilizationReport({
  branchId,
  dateFrom,
  dateTo,
}: GetLeaveUtilizationParams): Promise<LeaveUtilizationReport> {
  const range =
    dateFrom && dateTo ? getReportDateRange(dateFrom, dateTo) : null;

  const leaves = await prisma.leaveRequest.findMany({
    where: {
      deletedAt: null,
      employee: { branchId, deletedAt: null },
      ...(range
        ? {
            startDate: { lte: range.to },
            endDate: { gte: range.from },
          }
        : {}),
    },
    select: {
      type: true,
      status: true,
      startDate: true,
      endDate: true,
    },
  });

  const byType = new Map<string, { count: number; days: number }>();
  const byStatus = new Map<string, number>();
  let approvedDays = 0;

  for (const leave of leaves) {
    const days = countLeaveDays(leave.startDate, leave.endDate);
    const typeEntry = byType.get(leave.type) ?? { count: 0, days: 0 };
    typeEntry.count += 1;
    typeEntry.days += days;
    byType.set(leave.type, typeEntry);

    byStatus.set(leave.status, (byStatus.get(leave.status) ?? 0) + 1);

    if (leave.status === "APPROVED") {
      approvedDays += days;
    }
  }

  return {
    totalRequests: leaves.length,
    approvedDays,
    byType: Array.from(byType.entries()).map(([type, value]) => ({
      type,
      count: value.count,
      days: value.days,
    })),
    byStatus: Array.from(byStatus.entries()).map(([status, count]) => ({
      status,
      count,
    })),
    ...(range && dateFrom && dateTo
      ? { periodLabel: formatPeriodLabel(dateFrom, dateTo) }
      : {}),
  };
}
