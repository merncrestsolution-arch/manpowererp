import {
  buildExpenseSearchFilter,
  mapExpenseToDetail,
  mapExpenseToListItem,
  parseExpenseDate,
} from "@/application/mappers/expense-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { ListExpensesQuery } from "@/application/dto/expense.schema";
import type {
  ExpenseDetail,
  ExpenseFilterOptions,
  ExpenseListItem,
  PaginatedResult,
} from "@/types/expense";

type ListExpensesParams = {
  branchId: string;
  query: ListExpensesQuery;
};

const listInclude = {
  category: { select: { name: true } },
  paidBy: { select: { name: true } },
} as const;

const detailInclude = {
  category: { select: { name: true } },
  paidBy: { select: { name: true } },
  approvedBy: { select: { name: true } },
} as const;

export async function listExpenses({
  branchId,
  query,
}: ListExpensesParams): Promise<PaginatedResult<ExpenseListItem>> {
  const {
    page,
    pageSize,
    search,
    categoryId,
    status,
    paidById,
    dateFrom,
    dateTo,
    includeDeleted,
    sortBy,
    sortOrder,
  } = query;

  const parsedDateFrom = dateFrom ? parseExpenseDate(dateFrom) : null;
  const parsedDateTo = dateTo ? parseExpenseDate(dateTo) : null;

  const where = {
    branchId,
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(categoryId ? { categoryId } : {}),
    ...(status ? { status } : {}),
    ...(paidById ? { paidById } : {}),
    ...(parsedDateFrom || parsedDateTo
      ? {
          expenseDate: {
            ...(parsedDateFrom ? { gte: parsedDateFrom } : {}),
            ...(parsedDateTo ? { lte: parsedDateTo } : {}),
          },
        }
      : {}),
    ...buildExpenseSearchFilter(search),
  };

  const [total, expenses] = await Promise.all([
    prisma.expense.count({ where }),
    prisma.expense.findMany({
      where,
      include: listInclude,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: expenses.map(mapExpenseToListItem),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getExpenseById(
  branchId: string,
  expenseId: string,
): Promise<ExpenseDetail | null> {
  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, branchId, deletedAt: null },
    include: detailInclude,
  });

  return expense ? mapExpenseToDetail(expense) : null;
}

export async function getExpenseFilterOptions(
  branchId: string,
): Promise<ExpenseFilterOptions> {
  const [categories, submitters] = await Promise.all([
    prisma.expenseCategory.findMany({
      where: { branchId, deletedAt: null, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: {
        branchId,
        deletedAt: null,
        paidExpenses: { some: { branchId, deletedAt: null } },
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    categories,
    statuses: ["PENDING", "APPROVED", "REJECTED", "PAID"],
    submitters,
  };
}

export async function listExpenseApprovalHistory(
  branchId: string,
  expenseId: string,
) {
  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, branchId, deletedAt: null },
    select: { id: true },
  });

  if (!expense) {
    return [];
  }

  const history = await prisma.expenseApprovalHistory.findMany({
    where: { expenseId },
    orderBy: { changedAt: "desc" },
  });

  const userIds = [...new Set(history.map((entry) => entry.changedBy))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const userMap = new Map(users.map((user) => [user.id, user.name]));

  return history.map((entry) => ({
    id: entry.id,
    fromStatus: entry.fromStatus,
    toStatus: entry.toStatus,
    changedBy: entry.changedBy,
    changedByName: userMap.get(entry.changedBy) ?? entry.changedBy,
    changedAt: entry.changedAt.toISOString(),
    remarks: entry.remarks,
  }));
}
