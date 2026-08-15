import { prisma } from "@/infrastructure/db/prisma";

import type { CreateAccountInput } from "@/application/dto/account.schema";
import type { ChartAccountItem } from "@/types/finance";

type CreateAccountParams = {
  branchId: string;
  userId: string;
  input: CreateAccountInput;
};

type CreateAccountResult =
  | { success: true; account: ChartAccountItem }
  | { success: false; error: string };

function mapAccount(account: {
  id: string;
  code: string;
  name: string;
  type: ChartAccountItem["type"];
  parentAccountId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  parentAccount?: { name: string } | null;
}): ChartAccountItem {
  return {
    id: account.id,
    code: account.code,
    name: account.name,
    type: account.type,
    parentAccountId: account.parentAccountId,
    parentAccountName: account.parentAccount?.name ?? null,
    isActive: account.isActive,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}

export async function createAccount({
  branchId,
  userId,
  input,
}: CreateAccountParams): Promise<CreateAccountResult> {
  const existing = await prisma.chartAccount.findFirst({
    where: { branchId, code: input.code, deletedAt: null },
  });

  if (existing) {
    return {
      success: false,
      error: "An account with this code already exists",
    };
  }

  if (input.parentAccountId) {
    const parent = await prisma.chartAccount.findFirst({
      where: {
        id: input.parentAccountId,
        branchId,
        deletedAt: null,
      },
    });

    if (!parent) {
      return { success: false, error: "Parent account not found" };
    }
  }

  const account = await prisma.chartAccount.create({
    data: {
      branchId,
      code: input.code,
      name: input.name,
      type: input.type,
      parentAccountId: input.parentAccountId ?? null,
      isActive: input.isActive,
      createdBy: userId,
      updatedBy: userId,
    },
    include: { parentAccount: { select: { name: true } } },
  });

  return { success: true, account: mapAccount(account) };
}

export { mapAccount };
