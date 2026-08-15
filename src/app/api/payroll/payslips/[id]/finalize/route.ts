import { NextResponse } from "next/server";

import { finalizePayslip } from "@/application/use-cases/finalize-payslip";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canFinalizePayslip } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canFinalizePayslip(auth.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const result = await finalizePayslip({
    branchId: auth.branchId,
    payslipId: id,
    userId: auth.userId,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.payslip));
}
