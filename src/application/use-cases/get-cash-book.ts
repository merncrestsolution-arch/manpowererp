import { ensureDefaultChartAccounts } from "@/application/use-cases/seed-chart-accounts";
import { prisma } from "@/infrastructure/db/prisma";
import { CASH_BOOK_ACCOUNT_CODES } from "@/lib/chart-account-codes";
import { formatPeriodLabel, getReportDateRange } from "@/lib/finance-dates";

import type { CashBookEntry } from "@/types/finance";

type GetCashBookParams = {
  branchId: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
};

export async function getCashBook({
  branchId,
  userId,
  dateFrom,
  dateTo,
}: GetCashBookParams): Promise<{
  entries: CashBookEntry[];
  periodLabel: string;
  currency: string;
  openingBalance: number;
  closingBalance: number;
}> {
  await ensureDefaultChartAccounts(branchId, userId);

  const range = getReportDateRange(dateFrom, dateTo);
  if (!range) {
    return {
      entries: [],
      periodLabel: formatPeriodLabel(dateFrom, dateTo),
      currency: "LKR",
      openingBalance: 0,
      closingBalance: 0,
    };
  }

  const cashAccounts = await prisma.chartAccount.findMany({
    where: {
      branchId,
      code: { in: CASH_BOOK_ACCOUNT_CODES },
      deletedAt: null,
    },
    select: { id: true, code: true, name: true },
  });

  const accountIds = cashAccounts.map((account) => account.id);
  const accountMap = new Map(
    cashAccounts.map((account) => [account.id, account]),
  );

  const priorEntries = await prisma.ledgerEntry.findMany({
    where: {
      branchId,
      accountId: { in: accountIds },
      entryDate: { lt: range.from },
    },
    select: { debit: true, credit: true },
  });

  let runningBalance = priorEntries.reduce(
    (sum, entry) => sum + Number(entry.debit) - Number(entry.credit),
    0,
  );
  const openingBalance = runningBalance;

  const entries = await prisma.ledgerEntry.findMany({
    where: {
      branchId,
      accountId: { in: accountIds },
      entryDate: { gte: range.from, lte: range.to },
    },
    include: {
      journal: { select: { reference: true } },
    },
    orderBy: [{ entryDate: "asc" }, { createdAt: "asc" }],
  });

  const cashBookEntries: CashBookEntry[] = entries.map((entry) => {
    const debit = Number(entry.debit);
    const credit = Number(entry.credit);
    runningBalance += debit - credit;
    const account = accountMap.get(entry.accountId);

    return {
      id: entry.id,
      entryDate: entry.entryDate.toISOString(),
      accountCode: account?.code ?? "",
      accountName: account?.name ?? "",
      description: entry.description,
      debit,
      credit,
      runningBalance,
      sourceType: entry.sourceType,
    };
  });

  return {
    entries: cashBookEntries,
    periodLabel: formatPeriodLabel(dateFrom, dateTo),
    currency: "LKR",
    openingBalance,
    closingBalance: runningBalance,
  };
}
