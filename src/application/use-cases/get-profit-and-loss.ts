import { ensureDefaultChartAccounts } from "@/application/use-cases/seed-chart-accounts";
import { prisma } from "@/infrastructure/db/prisma";
import {
  formatPeriodLabel,
  getPreviousPeriodRange,
  getReportDateRange,
} from "@/lib/finance-dates";

import type { ProfitAndLossReport } from "@/types/finance";

type GetProfitAndLossParams = {
  branchId: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
};

async function sumByAccountType(
  branchId: string,
  type: "REVENUE" | "EXPENSE",
  from: Date,
  to: Date,
) {
  const accounts = await prisma.chartAccount.findMany({
    where: { branchId, type, deletedAt: null, isActive: true },
    select: { id: true, code: true, name: true },
  });

  const lines = await Promise.all(
    accounts.map(async (account) => {
      const entries = await prisma.ledgerEntry.findMany({
        where: {
          branchId,
          accountId: account.id,
          entryDate: { gte: from, lte: to },
        },
        select: { debit: true, credit: true },
      });

      const rawBalance = entries.reduce((sum, entry) => {
        const debit = Number(entry.debit);
        const credit = Number(entry.credit);
        return type === "REVENUE" ? sum + credit - debit : sum + debit - credit;
      }, 0);

      return {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        amount: rawBalance,
      };
    }),
  );

  return lines.filter((line) => line.amount !== 0);
}

export async function getProfitAndLoss({
  branchId,
  userId,
  dateFrom,
  dateTo,
}: GetProfitAndLossParams): Promise<ProfitAndLossReport> {
  await ensureDefaultChartAccounts(branchId, userId);

  const range = getReportDateRange(dateFrom, dateTo);
  if (!range) {
    return {
      periodLabel: formatPeriodLabel(dateFrom, dateTo),
      previousPeriodLabel: "",
      currency: "LKR",
      revenue: [],
      expenses: [],
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      previousTotalRevenue: 0,
      previousTotalExpenses: 0,
      previousNetProfit: 0,
    };
  }

  const previousRange = getPreviousPeriodRange(range.from, range.to);

  const [revenue, expenses, previousRevenue, previousExpenses] =
    await Promise.all([
      sumByAccountType(branchId, "REVENUE", range.from, range.to),
      sumByAccountType(branchId, "EXPENSE", range.from, range.to),
      sumByAccountType(
        branchId,
        "REVENUE",
        previousRange.from,
        previousRange.to,
      ),
      sumByAccountType(
        branchId,
        "EXPENSE",
        previousRange.from,
        previousRange.to,
      ),
    ]);

  const totalRevenue = revenue.reduce((sum, line) => sum + line.amount, 0);
  const totalExpenses = expenses.reduce((sum, line) => sum + line.amount, 0);
  const previousTotalRevenue = previousRevenue.reduce(
    (sum, line) => sum + line.amount,
    0,
  );
  const previousTotalExpenses = previousExpenses.reduce(
    (sum, line) => sum + line.amount,
    0,
  );

  return {
    periodLabel: formatPeriodLabel(dateFrom, dateTo),
    previousPeriodLabel: formatPeriodLabel(
      previousRange.from.toISOString().slice(0, 10),
      previousRange.to.toISOString().slice(0, 10),
    ),
    currency: "LKR",
    revenue,
    expenses,
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    previousTotalRevenue,
    previousTotalExpenses,
    previousNetProfit: previousTotalRevenue - previousTotalExpenses,
  };
}
