import { NextResponse } from "next/server";

import { payrollSummaryQuerySchema } from "@/application/dto/employee-salary-component.schema";
import { getPayrollSummaryReport } from "@/application/use-cases/get-payroll-summary-report";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManagePayroll } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManagePayroll(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = payrollSummaryQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const report = await getPayrollSummaryReport(
    context.branchId,
    parsed.data.periodId,
  );

  return NextResponse.json(successResponse(report));
}
