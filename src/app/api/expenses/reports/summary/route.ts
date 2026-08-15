import { NextResponse } from "next/server";

import { expenseReportQuerySchema } from "@/application/dto/expense.schema";
import { getExpenseReport } from "@/application/use-cases/get-expense-report";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canApproveExpense } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canApproveExpense(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = expenseReportQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const report = await getExpenseReport({
    branchId: context.branchId,
    query: parsed.data,
  });

  return NextResponse.json(successResponse(report));
}
