import { eachDayOfInterval, format } from "date-fns";

import { prisma } from "@/infrastructure/db/prisma";
import { formatPeriodLabel, getReportDateRange } from "@/lib/finance-dates";

import type { AttendanceSummaryReport } from "@/types/reports";

type GetAttendanceSummaryParams = {
  branchId: string;
  dateFrom: string;
  dateTo: string;
};

export async function getAttendanceSummaryReport({
  branchId,
  dateFrom,
  dateTo,
}: GetAttendanceSummaryParams): Promise<AttendanceSummaryReport> {
  const range = getReportDateRange(dateFrom, dateTo);

  if (!range) {
    return {
      periodLabel: formatPeriodLabel(dateFrom, dateTo),
      totals: {
        present: 0,
        late: 0,
        absent: 0,
        halfDay: 0,
        onLeave: 0,
      },
      trend: [],
    };
  }

  const records = await prisma.attendanceRecord.findMany({
    where: {
      deletedAt: null,
      employee: { branchId, deletedAt: null },
      date: { gte: range.from, lte: range.to },
    },
    select: { date: true, status: true },
  });

  const totals = {
    present: 0,
    late: 0,
    absent: 0,
    halfDay: 0,
    onLeave: 0,
  };

  const byDate = new Map<
    string,
    { present: number; late: number; absent: number; onLeave: number }
  >();

  for (const record of records) {
    const dateKey = format(record.date, "yyyy-MM-dd");
    const bucket = byDate.get(dateKey) ?? {
      present: 0,
      late: 0,
      absent: 0,
      onLeave: 0,
    };

    switch (record.status) {
      case "PRESENT":
        totals.present += 1;
        bucket.present += 1;
        break;
      case "LATE":
        totals.late += 1;
        bucket.late += 1;
        break;
      case "ABSENT":
        totals.absent += 1;
        bucket.absent += 1;
        break;
      case "HALF_DAY":
        totals.halfDay += 1;
        bucket.present += 1;
        break;
      case "ON_LEAVE":
        totals.onLeave += 1;
        bucket.onLeave += 1;
        break;
      default:
        break;
    }

    byDate.set(dateKey, bucket);
  }

  const days = eachDayOfInterval({ start: range.from, end: range.to });
  const trend = days.map((day) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const bucket = byDate.get(dateKey) ?? {
      present: 0,
      late: 0,
      absent: 0,
      onLeave: 0,
    };
    return { date: dateKey, ...bucket };
  });

  return {
    periodLabel: formatPeriodLabel(dateFrom, dateTo),
    totals,
    trend,
  };
}
