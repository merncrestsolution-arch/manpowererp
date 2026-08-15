import {
  mapExpenseToDetail,
  parseExpenseDate,
} from "@/application/mappers/expense-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { UpdateExpenseInput } from "@/application/dto/expense.schema";
import type { ExpenseDetail } from "@/types/expense";

type UpdateExpenseParams = {
  branchId: string;
  expenseId: string;
  userId: string;
  input: UpdateExpenseInput;
};

type UpdateExpenseResult =
  { success: true; expense: ExpenseDetail } | { success: false; error: string };

const detailInclude = {
  category: { select: { name: true } },
  paidBy: { select: { name: true } },
  approvedBy: { select: { name: true } },
} as const;

export async function updateExpense({
  branchId,
  expenseId,
  userId,
  input,
}: UpdateExpenseParams): Promise<UpdateExpenseResult> {
  const existing = await prisma.expense.findFirst({
    where: { id: expenseId, branchId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Expense not found" };
  }

  if (existing.status !== "PENDING" && existing.status !== "REJECTED") {
    return {
      success: false,
      error: "Only pending or rejected expenses can be edited",
    };
  }

  const expenseDate = parseExpenseDate(input.expenseDate);

  if (!expenseDate) {
    return { success: false, error: "Invalid expense date" };
  }

  const category = await prisma.expenseCategory.findFirst({
    where: {
      id: input.categoryId,
      branchId,
      deletedAt: null,
      isActive: true,
    },
  });

  if (!category) {
    return { success: false, error: "Expense category not found" };
  }

  try {
    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        categoryId: input.categoryId,
        description: input.description,
        amount: input.amount,
        expenseDate,
        receiptUrl: input.receiptUrl || existing.receiptUrl,
        status: "PENDING",
        rejectionReason: null,
        updatedBy: userId,
      },
      include: detailInclude,
    });

    return { success: true, expense: mapExpenseToDetail(expense) };
  } catch {
    return { success: false, error: "Failed to update expense" };
  }
}
