import { prisma } from "@/infrastructure/db/prisma";
import { DEFAULT_CHART_ACCOUNTS } from "@/lib/chart-account-codes";

export async function seedDefaultChartAccounts(
  branchId: string,
  userId?: string,
): Promise<void> {
  const existing = await prisma.chartAccount.count({
    where: { branchId, deletedAt: null },
  });

  if (existing > 0) {
    return;
  }

  await prisma.chartAccount.createMany({
    data: DEFAULT_CHART_ACCOUNTS.map((account) => ({
      branchId,
      code: account.code,
      name: account.name,
      type: account.type,
      isActive: true,
      createdBy: userId ?? null,
      updatedBy: userId ?? null,
    })),
  });
}

export async function getChartAccountIdByCode(
  branchId: string,
  code: string,
): Promise<string | null> {
  const account = await prisma.chartAccount.findFirst({
    where: { branchId, code, deletedAt: null, isActive: true },
    select: { id: true },
  });

  return account?.id ?? null;
}

export async function ensureDefaultChartAccounts(
  branchId: string,
  userId?: string,
): Promise<void> {
  await seedDefaultChartAccounts(branchId, userId);
}
