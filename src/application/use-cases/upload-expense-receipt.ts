import { prisma } from "@/infrastructure/db/prisma";

type UploadExpenseReceiptParams = {
  branchId: string;
  expenseId: string;
  userId: string;
  receiptUrl: string;
};

type UploadExpenseReceiptResult =
  { success: true; receiptUrl: string } | { success: false; error: string };

export async function uploadExpenseReceipt({
  branchId,
  expenseId,
  userId,
  receiptUrl,
}: UploadExpenseReceiptParams): Promise<UploadExpenseReceiptResult> {
  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, branchId, deletedAt: null },
  });

  if (!expense) {
    return { success: false, error: "Expense not found" };
  }

  await prisma.expense.update({
    where: { id: expenseId },
    data: {
      receiptUrl,
      updatedBy: userId,
    },
  });

  return { success: true, receiptUrl };
}
