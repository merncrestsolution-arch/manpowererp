import { endOfDay, startOfDay } from "date-fns";

import { prisma } from "@/infrastructure/db/prisma";
import { parseReportDate } from "@/lib/finance-dates";

import type { LedgerEntryItem } from "@/types/finance";

type GetLedgerForAccountParams = {
  branchId: string;
  accountId: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function getLedgerForAccount({
  branchId,
  accountId,
  dateFrom,
  dateTo,
}: GetLedgerForAccountParams): Promise<{
  entries: LedgerEntryItem[];
  openingBalance: number;
  closingBalance: number;
}> {
  const account = await prisma.chartAccount.findFirst({
    where: { id: accountId, branchId, deletedAt: null },
    select: { id: true, type: true },
  });

  if (!account) {
    return { entries: [], openingBalance: 0, closingBalance: 0 };
  }

  const fromDate = dateFrom ? parseReportDate(dateFrom) : null;
  const toDate = dateTo ? parseReportDate(dateTo) : null;

  const priorWhere = {
    branchId,
    accountId,
    ...(fromDate ? { entryDate: { lt: startOfDay(fromDate) } } : {}),
  };

  const priorEntries = await prisma.ledgerEntry.findMany({
    where: priorWhere,
    select: { debit: true, credit: true },
  });

  const isDebitNormal = account.type === "ASSET" || account.type === "EXPENSE";

  let runningBalance = priorEntries.reduce((sum, entry) => {
    const debit = Number(entry.debit);
    const credit = Number(entry.credit);
    return isDebitNormal ? sum + debit - credit : sum + credit - debit;
  }, 0);

  const openingBalance = runningBalance;

  const entries = await prisma.ledgerEntry.findMany({
    where: {
      branchId,
      accountId,
      ...(fromDate || toDate
        ? {
            entryDate: {
              ...(fromDate ? { gte: startOfDay(fromDate) } : {}),
              ...(toDate ? { lte: endOfDay(toDate) } : {}),
            },
          }
        : {}),
    },
    include: {
      journal: { select: { reference: true } },
    },
    orderBy: [{ entryDate: "asc" }, { createdAt: "asc" }],
  });

  const ledgerEntries: LedgerEntryItem[] = entries.map((entry) => {
    const debit = Number(entry.debit);
    const credit = Number(entry.credit);
    runningBalance += isDebitNormal ? debit - credit : credit - debit;

    return {
      id: entry.id,
      entryDate: entry.entryDate.toISOString(),
      description: entry.description,
      debit,
      credit,
      sourceType: entry.sourceType,
      sourceId: entry.sourceId,
      journalReference: entry.journal.reference,
      runningBalance,
    };
  });

  return {
    entries: ledgerEntries,
    openingBalance,
    closingBalance: runningBalance,
  };
}
