import { NextResponse } from "next/server";

import {
  createExpenseSchema,
  listExpensesQuerySchema,
} from "@/application/dto/expense.schema";
import { createExpense } from "@/application/use-cases/create-expense";
import {
  getExpenseFilterOptions,
  listExpenses,
} from "@/application/use-cases/list-expenses";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canSubmitExpense, hasAdminAccess } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canSubmitExpense(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = listExpensesQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const query = {
    ...parsed.data,
    includeDeleted:
      parsed.data.includeDeleted && hasAdminAccess(context.role) ? true : false,
  };

  const [result, filterOptions] = await Promise.all([
    listExpenses({ branchId: context.branchId, query }),
    getExpenseFilterOptions(context.branchId),
  ]);

  return NextResponse.json(
    successResponse({
      ...result,
      filterOptions,
    }),
  );
}

export async function POST(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canSubmitExpense(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = createExpenseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await createExpense({
    branchId: context.branchId,
    userId: context.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.expense), { status: 201 });
}
