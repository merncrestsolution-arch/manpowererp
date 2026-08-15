import { ensureDefaultChartAccounts } from "@/application/use-cases/seed-chart-accounts";
import { prisma } from "@/infrastructure/db/prisma";
import { CASH_BOOK_ACCOUNT_CODES } from "@/lib/chart-account-codes";
import { formatPeriodLabel, getReportDateRange } from "@/lib/finance-dates";

import type {
  CashFlowGroup,
  CashFlowReport,
  LedgerSourceType,
} from "@/types/finance";

type GetCashFlowParams = {
  branchId: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
};

const SOURCE_LABELS: Record<LedgerSourceType, string> = {
  PAYROLL: "Payroll",
  EXPENSE: "Expenses",
  INVOICE: "Invoices",
  PAYMENT: "Payments",
  MANUAL: "Manual",
};

export async function getCashFlow({
  branchId,
  userId,
  dateFrom,
  dateTo,
}: GetCashFlowParams): Promise<CashFlowReport> {
  await ensureDefaultChartAccounts(branchId, userId);

  const range = getReportDateRange(dateFrom, dateTo);
  if (!range) {
    return {
      periodLabel: formatPeriodLabel(dateFrom, dateTo),
      currency: "LKR",
      groups: [],
      totalInflow: 0,
      totalOutflow: 0,
      netCashFlow: 0,
      chartData: [],
    };
  }

  const cashAccounts = await prisma.chartAccount.findMany({
    where: {
      branchId,
      code: { in: CASH_BOOK_ACCOUNT_CODES },
      deletedAt: null,
    },
    select: { id: true },
  });

  const accountIds = cashAccounts.map((account) => account.id);

  const entries = await prisma.ledgerEntry.findMany({
    where: {
      branchId,
      accountId: { in: accountIds },
      entryDate: { gte: range.from, lte: range.to },
    },
    select: {
      sourceType: true,
      debit: true,
      credit: true,
    },
  });

  const grouped = new Map<
    LedgerSourceType,
    { inflow: number; outflow: number }
  >();

  for (const entry of entries) {
    const current = grouped.get(entry.sourceType) ?? { inflow: 0, outflow: 0 };
    current.inflow += Number(entry.debit);
    current.outflow += Number(entry.credit);
    grouped.set(entry.sourceType, current);
  }

  const groups: CashFlowGroup[] = Array.from(grouped.entries()).map(
    ([sourceType, values]) => ({
      sourceType,
      label: SOURCE_LABELS[sourceType],
      inflow: values.inflow,
      outflow: values.outflow,
      net: values.inflow - values.outflow,
    }),
  );

  const totalInflow = groups.reduce((sum, group) => sum + group.inflow, 0);
  const totalOutflow = groups.reduce((sum, group) => sum + group.outflow, 0);

  return {
    periodLabel: formatPeriodLabel(dateFrom, dateTo),
    currency: "LKR",
    groups,
    totalInflow,
    totalOutflow,
    netCashFlow: totalInflow - totalOutflow,
    chartData: groups.map((group) => ({
      label: group.label,
      inflow: group.inflow,
      outflow: group.outflow,
      net: group.net,
    })),
  };
}
