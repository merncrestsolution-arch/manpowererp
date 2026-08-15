import { mapAccount } from "@/application/use-cases/create-account";
import { prisma } from "@/infrastructure/db/prisma";

import type { UpdateAccountInput } from "@/application/dto/account.schema";
import type { ChartAccountItem } from "@/types/finance";

type UpdateAccountParams = {
  branchId: string;
  accountId: string;
  userId: string;
  input: UpdateAccountInput;
};

type UpdateAccountResult =
  | { success: true; account: ChartAccountItem }
  | { success: false; error: string };

export async function updateAccount({
  branchId,
  accountId,
  userId,
  input,
}: UpdateAccountParams): Promise<UpdateAccountResult> {
  const existing = await prisma.chartAccount.findFirst({
    where: { id: accountId, branchId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Account not found" };
  }

  if (input.code && input.code !== existing.code) {
    const duplicate = await prisma.chartAccount.findFirst({
      where: {
        branchId,
        code: input.code,
        deletedAt: null,
        NOT: { id: accountId },
      },
    });

    if (duplicate) {
      return {
        success: false,
        error: "An account with this code already exists",
      };
    }
  }

  if (input.parentAccountId) {
    if (input.parentAccountId === accountId) {
      return { success: false, error: "Account cannot be its own parent" };
    }

    const parent = await prisma.chartAccount.findFirst({
      where: { id: input.parentAccountId, branchId, deletedAt: null },
    });

    if (!parent) {
      return { success: false, error: "Parent account not found" };
    }
  }

  const account = await prisma.chartAccount.update({
    where: { id: accountId },
    data: {
      code: input.code,
      name: input.name,
      type: input.type,
      parentAccountId:
        input.parentAccountId === undefined ? undefined : input.parentAccountId,
      isActive: input.isActive,
      updatedBy: userId,
    },
    include: { parentAccount: { select: { name: true } } },
  });

  return { success: true, account: mapAccount(account) };
}
