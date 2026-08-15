import { NextResponse } from "next/server";

import { getExpenseBreakdown } from "@/application/use-cases/get-expense-breakdown";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  const context = await getAuthenticatedContext();

  if (!context) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const breakdown = await getExpenseBreakdown(context.branchId);

  return NextResponse.json(successResponse(breakdown));
}
