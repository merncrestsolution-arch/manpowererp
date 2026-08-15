import type {
  ExpenseApprovalHistoryItem,
  ExpenseDetail,
  ExpenseListItem,
} from "@/types/expense";
import type { ExpenseApprovalHistory, Prisma } from "@prisma/client";

type ExpenseListInclude = Prisma.ExpenseGetPayload<{
  include: {
    category: { select: { name: true } };
    paidBy: { select: { name: true } };
  };
}>;

type ExpenseDetailInclude = Prisma.ExpenseGetPayload<{
  include: {
    category: { select: { name: true } };
    paidBy: { select: { name: true } };
    approvedBy: { select: { name: true } };
  };
}>;

export function mapExpenseToListItem(
  expense: ExpenseListInclude,
): ExpenseListItem {
  return {
    id: expense.id,
    expenseNo: expense.expenseNo,
    categoryId: expense.categoryId,
    categoryName: expense.category.name,
    description: expense.description,
    amount: Number(expense.amount),
    expenseDate: expense.expenseDate.toISOString(),
    paidById: expense.paidById,
    paidByName: expense.paidBy.name,
    status: expense.status,
    receiptUrl: expense.receiptUrl,
    createdAt: expense.createdAt.toISOString(),
  };
}

export function mapExpenseToDetail(
  expense: ExpenseDetailInclude,
): ExpenseDetail {
  return {
    id: expense.id,
    expenseNo: expense.expenseNo,
    categoryId: expense.categoryId,
    categoryName: expense.category.name,
    description: expense.description,
    amount: Number(expense.amount),
    expenseDate: expense.expenseDate.toISOString(),
    paidById: expense.paidById,
    paidByName: expense.paidBy.name,
    receiptUrl: expense.receiptUrl,
    status: expense.status,
    approvedById: expense.approvedById,
    approvedByName: expense.approvedBy?.name ?? null,
    approvedAt: expense.approvedAt?.toISOString() ?? null,
    rejectionReason: expense.rejectionReason,
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
    createdBy: expense.createdBy,
    updatedBy: expense.updatedBy,
  };
}

export function mapExpenseApprovalHistory(
  entry: ExpenseApprovalHistory & { changedByName?: string },
): ExpenseApprovalHistoryItem {
  return {
    id: entry.id,
    fromStatus: entry.fromStatus,
    toStatus: entry.toStatus,
    changedBy: entry.changedBy,
    changedByName: entry.changedByName ?? entry.changedBy,
    changedAt: entry.changedAt.toISOString(),
    remarks: entry.remarks,
  };
}

export function buildExpenseSearchFilter(search?: string) {
  if (!search) {
    return {};
  }

  return {
    OR: [
      { expenseNo: { contains: search, mode: "insensitive" as const } },
      { description: { contains: search, mode: "insensitive" as const } },
      {
        category: { name: { contains: search, mode: "insensitive" as const } },
      },
      { paidBy: { name: { contains: search, mode: "insensitive" as const } } },
    ],
  };
}

export function parseExpenseDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
