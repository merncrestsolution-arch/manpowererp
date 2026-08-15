import { NextResponse } from "next/server";

import {
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
} from "@/application/dto/expense-category.schema";
import { createExpenseCategory } from "@/application/use-cases/create-expense-category";
import { listExpenseCategories } from "@/application/use-cases/list-expense-categories";
import { updateExpenseCategory } from "@/application/use-cases/update-expense-category";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import {
  canManageExpenseCategories,
  canSubmitExpense,
} from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  const context = await getAuthenticatedContext();

  if (!context || !canSubmitExpense(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const categories = await listExpenseCategories(context.branchId);

  return NextResponse.json(successResponse(categories));
}

export async function POST(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageExpenseCategories(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = createExpenseCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await createExpenseCategory({
    branchId: context.branchId,
    userId: context.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.category), { status: 201 });
}

export async function PATCH(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageExpenseCategories(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const categoryId = body.id as string | undefined;

  if (!categoryId) {
    return NextResponse.json(errorResponse("Category id is required"), {
      status: 400,
    });
  }

  const parsed = updateExpenseCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await updateExpenseCategory({
    branchId: context.branchId,
    categoryId,
    userId: context.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.category));
}
