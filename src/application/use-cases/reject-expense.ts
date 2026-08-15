import { mapExpenseToDetail } from "@/application/mappers/expense-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { RejectExpenseInput } from "@/application/dto/expense-approval.schema";
import type { ExpenseDetail } from "@/types/expense";

type RejectExpenseParams = {
  branchId: string;
  expenseId: string;
  userId: string;
  input: RejectExpenseInput;
};

type RejectExpenseResult =
  { success: true; expense: ExpenseDetail } | { success: false; error: string };

const detailInclude = {
  category: { select: { name: true } },
  paidBy: { select: { name: true } },
  approvedBy: { select: { name: true } },
} as const;

export async function rejectExpense({
  branchId,
  expenseId,
  userId,
  input,
}: RejectExpenseParams): Promise<RejectExpenseResult> {
  const existing = await prisma.expense.findFirst({
    where: { id: expenseId, branchId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Expense not found" };
  }

  if (existing.status !== "PENDING") {
    return { success: false, error: "Only pending expenses can be rejected" };
  }

  const expense = await prisma.$transaction(async (tx) => {
    const updated = await tx.expense.update({
      where: { id: expenseId },
      data: {
        status: "REJECTED",
        approvedById: userId,
        approvedAt: new Date(),
        rejectionReason: input.reason,
        updatedBy: userId,
      },
      include: detailInclude,
    });

    await tx.expenseApprovalHistory.create({
      data: {
        expenseId,
        fromStatus: existing.status,
        toStatus: "REJECTED",
        changedBy: userId,
        remarks: input.remarks || input.reason,
      },
    });

    return updated;
  });

  return { success: true, expense: mapExpenseToDetail(expense) };
}
