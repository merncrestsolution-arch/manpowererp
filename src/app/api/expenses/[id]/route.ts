import { NextResponse } from "next/server";

import { updateExpenseSchema } from "@/application/dto/expense.schema";
import {
  getExpenseById,
  listExpenseApprovalHistory,
} from "@/application/use-cases/list-expenses";
import { updateExpense } from "@/application/use-cases/update-expense";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canSubmitExpense } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canSubmitExpense(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const [expense, history] = await Promise.all([
    getExpenseById(authContext.branchId, id),
    listExpenseApprovalHistory(authContext.branchId, id),
  ]);

  if (!expense) {
    return NextResponse.json(errorResponse("Expense not found"), {
      status: 404,
    });
  }

  return NextResponse.json(successResponse({ expense, history }));
}

export async function PATCH(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canSubmitExpense(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = updateExpenseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await updateExpense({
    branchId: authContext.branchId,
    expenseId: id,
    userId: authContext.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.expense));
}
