import { NextResponse } from "next/server";

import { getPayslip } from "@/application/use-cases/run-payroll";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManagePayroll } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canManagePayroll(auth.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const payslip = await getPayslip(auth.branchId, id);

  if (!payslip) {
    return NextResponse.json(errorResponse("Payslip not found"), {
      status: 404,
    });
  }

  return NextResponse.json(successResponse(payslip));
}
