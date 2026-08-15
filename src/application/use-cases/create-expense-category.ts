import { prisma } from "@/infrastructure/db/prisma";

import type { CreateExpenseCategoryInput } from "@/application/dto/expense-category.schema";
import type { ExpenseCategoryItem } from "@/types/expense";

type CreateExpenseCategoryParams = {
  branchId: string;
  userId: string;
  input: CreateExpenseCategoryInput;
};

type CreateExpenseCategoryResult =
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

export async function createExpenseCategory({
  branchId,
  userId,
  input,
}: CreateExpenseCategoryParams): Promise<CreateExpenseCategoryResult> {
  const existing = await prisma.expenseCategory.findFirst({
    where: {
      branchId,
      name: { equals: input.name, mode: "insensitive" },
      deletedAt: null,
    },
  });

  if (existing) {
    return {
      success: false,
      error: "A category with this name already exists",
    };
  }

  const category = await prisma.expenseCategory.create({
    data: {
      branchId,
      name: input.name,
      description: input.description || null,
      isActive: input.isActive,
      createdBy: userId,
      updatedBy: userId,
    },
  });

  return { success: true, category: mapCategory(category) };
}
