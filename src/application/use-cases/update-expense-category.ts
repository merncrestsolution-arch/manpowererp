import { prisma } from "@/infrastructure/db/prisma";

import type { UpdateExpenseCategoryInput } from "@/application/dto/expense-category.schema";
import type { ExpenseCategoryItem } from "@/types/expense";

type UpdateExpenseCategoryParams = {
  branchId: string;
  categoryId: string;
  userId: string;
  input: UpdateExpenseCategoryInput;
};

type UpdateExpenseCategoryResult =
  | { success: true; category: ExpenseCategoryItem }
  | { success: false; error: string };

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

export async function updateExpenseCategory({
  branchId,
  categoryId,
  userId,
  input,
}: UpdateExpenseCategoryParams): Promise<UpdateExpenseCategoryResult> {
  const existing = await prisma.expenseCategory.findFirst({
    where: { id: categoryId, branchId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Category not found" };
  }

  if (input.name && input.name !== existing.name) {
    const duplicate = await prisma.expenseCategory.findFirst({
      where: {
        branchId,
        name: { equals: input.name, mode: "insensitive" },
        deletedAt: null,
        id: { not: categoryId },
      },
    });

    if (duplicate) {
      return {
        success: false,
        error: "A category with this name already exists",
      };
    }
  }

  const category = await prisma.expenseCategory.update({
    where: { id: categoryId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined
        ? { description: input.description || null }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      updatedBy: userId,
    },
  });

  return { success: true, category: mapCategory(category) };
}
