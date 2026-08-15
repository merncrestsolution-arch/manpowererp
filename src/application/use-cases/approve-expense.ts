import { mapExpenseToDetail } from "@/application/mappers/expense-mapper";
import { postJournalEntry } from "@/application/use-cases/post-journal-entry";
import { prisma } from "@/infrastructure/db/prisma";
import { CHART_ACCOUNT_CODES } from "@/lib/chart-account-codes";

import type { ApproveExpenseInput } from "@/application/dto/expense-approval.schema";
import type { ExpenseDetail } from "@/types/expense";

type ApproveExpenseParams = {
  branchId: string;
  expenseId: string;
  userId: string;
  input: ApproveExpenseInput;
};

type ApproveExpenseResult =
  { success: true; expense: ExpenseDetail } | { success: false; error: string };

const detailInclude = {
  category: { select: { name: true } },
  paidBy: { select: { name: true } },
  approvedBy: { select: { name: true } },
} as const;

export async function approveExpense({
  branchId,
  expenseId,
  userId,
  input,
}: ApproveExpenseParams): Promise<ApproveExpenseResult> {
  const existing = await prisma.expense.findFirst({
    where: { id: expenseId, branchId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Expense not found" };
  }

  if (existing.status !== "PENDING") {
    return { success: false, error: "Only pending expenses can be approved" };
  }

  const expense = await prisma.$transaction(async (tx) => {
    const updated = await tx.expense.update({
      where: { id: expenseId },
      data: {
        status: "APPROVED",
        approvedById: userId,
        approvedAt: new Date(),
        rejectionReason: null,
        updatedBy: userId,
      },
      include: detailInclude,
    });

    await tx.expenseApprovalHistory.create({
      data: {
        expenseId,
        fromStatus: existing.status,
        toStatus: "APPROVED",
        changedBy: userId,
        remarks: input.remarks || null,
      },
    });

    return updated;
  });

  await postJournalEntry({
    branchId,
    userId,
    reference: `EXP-${expense.expenseNo}`,
    date: expense.expenseDate,
    description: expense.description,
    sourceType: "EXPENSE",
    sourceId: expenseId,
    lines: [
      {
        accountCode: CHART_ACCOUNT_CODES.GENERAL_EXPENSE,
        description: "Expense approved",
        debit: Number(expense.amount),
        credit: 0,
      },
      {
        accountCode: CHART_ACCOUNT_CODES.ACCOUNTS_PAYABLE,
        description: "Expense payable",
        debit: 0,
        credit: Number(expense.amount),
      },
    ],
  });

  return { success: true, expense: mapExpenseToDetail(expense) };
}
