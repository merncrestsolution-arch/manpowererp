import { NextResponse } from "next/server";

import { runPayroll } from "@/application/use-cases/run-payroll";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canRunPayroll } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canRunPayroll(auth.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const result = await runPayroll({
    branchId: auth.branchId,
    periodId: id,
    userId: auth.userId,
  });

  return NextResponse.json(successResponse(result));
}
