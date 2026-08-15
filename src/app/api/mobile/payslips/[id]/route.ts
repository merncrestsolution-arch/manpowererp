import { NextResponse } from "next/server";

import { getPayslip } from "@/application/use-cases/run-payroll";
import { requireMobileEmployee } from "@/infrastructure/auth/mobile-auth";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const mobileContext = await requireMobileEmployee(request);

  if (!mobileContext) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const payslip = await getPayslip(mobileContext.branchId, id);

  if (!payslip || payslip.employeeId !== mobileContext.employee.id) {
    return NextResponse.json(errorResponse("Payslip not found"), {
      status: 404,
    });
  }

  if (payslip.status === "DRAFT") {
    return NextResponse.json(errorResponse("Payslip not available"), {
      status: 403,
    });
  }

  return NextResponse.json(successResponse(payslip));
}
