import { endOfMonth, format, startOfMonth } from "date-fns";

import { getExpenseReport } from "@/application/use-cases/get-expense-report";

import type { ExpenseBreakdownData } from "@/types/dashboard";

export async function getExpenseBreakdown(
  branchId: string,
): Promise<ExpenseBreakdownData> {
  const now = new Date();
  const report = await getExpenseReport({
    branchId,
    query: {
      dateFrom: startOfMonth(now).toISOString(),
      dateTo: endOfMonth(now).toISOString(),
    },
  });

  return {
    categories: report.byCategory,
    periodLabel: format(now, "MMMM yyyy"),
  };
}
