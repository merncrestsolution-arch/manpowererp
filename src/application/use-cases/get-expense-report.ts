import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";

import { parseExpenseDate } from "@/application/mappers/expense-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { ExpenseReportQuery } from "@/application/dto/expense.schema";
import type { ExpenseReportSummary } from "@/types/expense";

type GetExpenseReportParams = {
  branchId: string;
  query: ExpenseReportQuery;
};

export async function getExpenseReport({
  branchId,
  query,
}: GetExpenseReportParams): Promise<ExpenseReportSummary> {
  const now = new Date();
  const periodStart =
    (query.dateFrom ? parseExpenseDate(query.dateFrom) : null) ??
    startOfMonth(now);
  const periodEnd =
    (query.dateTo ? parseExpenseDate(query.dateTo) : null) ?? endOfMonth(now);

  const where = {
    branchId,
    deletedAt: null,
    expenseDate: {
      gte: periodStart,
      lte: periodEnd,
    },
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
  };

  const expenses = await prisma.expense.findMany({
    where,
    include: { category: { select: { name: true } } },
    orderBy: { expenseDate: "asc" },
  });

  const sumByStatus = (status: string) =>
    expenses
      .filter((expense) => expense.status === status)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);

  const totalAmount = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );

  const categoryTotals = new Map<string, number>();
  for (const expense of expenses) {
    const key = expense.category.name;
    categoryTotals.set(
      key,
      (categoryTotals.get(key) ?? 0) + Number(expense.amount),
    );
  }

  const trendStart = subMonths(periodStart, 5);
  const trendExpenses = await prisma.expense.findMany({
    where: {
      branchId,
      deletedAt: null,
      expenseDate: { gte: trendStart, lte: periodEnd },
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    },
    select: { expenseDate: true, amount: true },
  });

  const trendMap = new Map<string, number>();
  for (let index = 5; index >= 0; index -= 1) {
    const monthDate = subMonths(periodEnd, index);
    trendMap.set(format(monthDate, "MMM yyyy"), 0);
  }

  for (const expense of trendExpenses) {
    const label = format(expense.expenseDate, "MMM yyyy");
    if (trendMap.has(label)) {
      trendMap.set(label, (trendMap.get(label) ?? 0) + Number(expense.amount));
    }
  }

  return {
    periodLabel: `${format(periodStart, "dd MMM yyyy")} – ${format(periodEnd, "dd MMM yyyy")}`,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    totalAmount,
    approvedAmount: sumByStatus("APPROVED") + sumByStatus("PAID"),
    pendingAmount: sumByStatus("PENDING"),
    rejectedAmount: sumByStatus("REJECTED"),
    paidAmount: sumByStatus("PAID"),
    byCategory: [...categoryTotals.entries()].map(([label, value]) => ({
      label,
      value,
    })),
    trend: [...trendMap.entries()].map(([label, value]) => ({ label, value })),
    currency: "LKR",
  };
}
