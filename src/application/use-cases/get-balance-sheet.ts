import { endOfDay } from "date-fns";

import { ensureDefaultChartAccounts } from "@/application/use-cases/seed-chart-accounts";
import { prisma } from "@/infrastructure/db/prisma";
import { parseReportDate } from "@/lib/finance-dates";

import type { BalanceSheetReport, ChartAccountType } from "@/types/finance";

type GetBalanceSheetParams = {
  branchId: string;
  userId: string;
  asOfDate: string;
};

async function getBalancesByType(
  branchId: string,
  type: ChartAccountType,
  asOf: Date,
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
          entryDate: { lte: asOf },
        },
        select: { debit: true, credit: true },
      });

      const balance = entries.reduce((sum, entry) => {
        const debit = Number(entry.debit);
        const credit = Number(entry.credit);
        if (type === "ASSET" || type === "EXPENSE") {
          return sum + debit - credit;
        }
        return sum + credit - debit;
      }, 0);

      return {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        balance,
      };
    }),
  );

  return lines.filter((line) => line.balance !== 0);
}

export async function getBalanceSheet({
  branchId,
  userId,
  asOfDate,
}: GetBalanceSheetParams): Promise<BalanceSheetReport> {
  await ensureDefaultChartAccounts(branchId, userId);

  const parsedDate = parseReportDate(asOfDate);
  if (!parsedDate) {
    return {
      asOfDate,
      currency: "LKR",
      assets: [],
      liabilities: [],
      equity: [],
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      isBalanced: true,
      difference: 0,
    };
  }

  const asOf = endOfDay(parsedDate);

  const [assets, liabilities, equity] = await Promise.all([
    getBalancesByType(branchId, "ASSET", asOf),
    getBalancesByType(branchId, "LIABILITY", asOf),
    getBalancesByType(branchId, "EQUITY", asOf),
  ]);

  const totalAssets = assets.reduce((sum, line) => sum + line.balance, 0);
  const totalLiabilities = liabilities.reduce(
    (sum, line) => sum + line.balance,
    0,
  );
  const totalEquity = equity.reduce((sum, line) => sum + line.balance, 0);
  const difference = totalAssets - (totalLiabilities + totalEquity);

  return {
    asOfDate,
    currency: "LKR",
    assets,
    liabilities,
    equity,
    totalAssets,
    totalLiabilities,
    totalEquity,
    isBalanced: Math.abs(difference) < 0.01,
    difference,
  };
}
