import { NextResponse } from "next/server";

import { rejectExpenseSchema } from "@/application/dto/expense-approval.schema";
import { rejectExpense } from "@/application/use-cases/reject-expense";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canApproveExpense } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canApproveExpense(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = rejectExpenseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await rejectExpense({
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
