import { mapAccount } from "@/application/use-cases/create-account";
import { prisma } from "@/infrastructure/db/prisma";

import type { ChartAccountItem, ChartAccountType } from "@/types/finance";

type ListAccountsParams = {
  branchId: string;
  search?: string;
  type?: ChartAccountType;
  isActive?: boolean;
  includeDeleted?: boolean;
};

export async function listAccounts({
  branchId,
  search,
  type,
  isActive,
  includeDeleted = false,
}: ListAccountsParams): Promise<ChartAccountItem[]> {
  const accounts = await prisma.chartAccount.findMany({
    where: {
      branchId,
      deletedAt: includeDeleted ? undefined : null,
      type,
      isActive,
      OR: search
        ? [
            { code: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: { parentAccount: { select: { name: true } } },
    orderBy: [{ code: "asc" }],
  });

  return accounts.map(mapAccount);
}

export async function getAccountById(
  branchId: string,
  accountId: string,
): Promise<ChartAccountItem | null> {
  const account = await prisma.chartAccount.findFirst({
    where: { id: accountId, branchId, deletedAt: null },
    include: { parentAccount: { select: { name: true } } },
  });

  return account ? mapAccount(account) : null;
}
