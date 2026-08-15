import { format, subMonths } from "date-fns";

import { prisma } from "@/infrastructure/db/prisma";
import { getColomboMonthRange } from "@/lib/date";

import type { ChartDataPoint, RevenueTrendData } from "@/types/dashboard";

const billedInvoiceStatuses = [
  "SENT",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
] as const;

export async function getRevenueTrend(
  branchId: string,
): Promise<RevenueTrendData> {
  const now = new Date();
  const currentMonth = getColomboMonthRange(now);
  const windowStart = getColomboMonthRange(
    subMonths(currentMonth.start, 11),
  ).start;

  const invoices = await prisma.invoice.findMany({
    where: {
      branchId,
      deletedAt: null,
      status: { in: [...billedInvoiceStatuses] },
      issueDate: { gte: windowStart, lte: currentMonth.end },
    },
    select: { issueDate: true, total: true },
  });

  const points: ChartDataPoint[] = [];

  for (let offset = 11; offset >= 0; offset -= 1) {
    const monthDate = subMonths(currentMonth.start, offset);
    const range = getColomboMonthRange(monthDate);
    const label = format(range.start, "MMM");
    const value = invoices
      .filter(
        (invoice) =>
          invoice.issueDate >= range.start && invoice.issueDate <= range.end,
      )
      .reduce((sum, invoice) => sum + Number(invoice.total), 0);

    points.push({ label, value });
  }

  return {
    points: points.some((point) => point.value > 0) ? points : [],
    periodLabel: `${format(subMonths(now, 11), "MMM yyyy")} – ${format(now, "MMM yyyy")}`,
  };
}
