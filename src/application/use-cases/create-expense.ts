import {
  mapExpenseToDetail,
  parseExpenseDate,
} from "@/application/mappers/expense-mapper";
import { prisma } from "@/infrastructure/db/prisma";
import { formatExpenseNo, getNextSequenceValue } from "@/lib/sequence";

import type { CreateExpenseInput } from "@/application/dto/expense.schema";
import type { ExpenseDetail } from "@/types/expense";

type CreateExpenseParams = {
  branchId: string;
  userId: string;
  input: CreateExpenseInput;
};

type CreateExpenseResult =
  { success: true; expense: ExpenseDetail } | { success: false; error: string };

const detailInclude = {
  category: { select: { name: true } },
  paidBy: { select: { name: true } },
  approvedBy: { select: { name: true } },
} as const;

export async function createExpense({
  branchId,
  userId,
  input,
}: CreateExpenseParams): Promise<CreateExpenseResult> {
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
    const expense = await prisma.$transaction(async (tx) => {
      const sequenceValue = await getNextSequenceValue(
        tx,
        branchId,
        "expense_no",
      );
      const expenseNo = formatExpenseNo(sequenceValue);

      const created = await tx.expense.create({
        data: {
          branchId,
          expenseNo,
          categoryId: input.categoryId,
          description: input.description,
          amount: input.amount,
          expenseDate,
          paidById: userId,
          receiptUrl: input.receiptUrl || null,
          status: "PENDING",
          createdBy: userId,
          updatedBy: userId,
        },
        include: detailInclude,
      });

      await tx.expenseApprovalHistory.create({
        data: {
          expenseId: created.id,
          fromStatus: null,
          toStatus: "PENDING",
          changedBy: userId,
          remarks: "Expense submitted",
        },
      });

      return created;
    });

    return { success: true, expense: mapExpenseToDetail(expense) };
  } catch {
    return { success: false, error: "Failed to create expense" };
  }
}
