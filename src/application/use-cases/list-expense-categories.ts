import { prisma } from "@/infrastructure/db/prisma";

import type { ExpenseCategoryItem } from "@/types/expense";

function mapCategory(category: {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ExpenseCategoryItem {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    isActive: category.isActive,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

export async function listExpenseCategories(
  branchId: string,
  options?: { activeOnly?: boolean },
): Promise<ExpenseCategoryItem[]> {
  const categories = await prisma.expenseCategory.findMany({
    where: {
      branchId,
      deletedAt: null,
      ...(options?.activeOnly ? { isActive: true } : {}),
    },
    orderBy: { name: "asc" },
  });

  return categories.map(mapCategory);
}
