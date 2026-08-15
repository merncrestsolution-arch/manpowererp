import { NextResponse } from "next/server";

import { listPayslipsQuerySchema } from "@/application/dto/employee-salary-component.schema";
import { listPayslips } from "@/application/use-cases/run-payroll";
import { requireMobileEmployee } from "@/infrastructure/auth/mobile-auth";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await requireMobileEmployee(request);

  if (!context) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = listPayslipsQuerySchema.safeParse({
    ...Object.fromEntries(searchParams.entries()),
    employeeId: context.employee.id,
    status: searchParams.get("status") ?? "FINALIZED",
  });

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const result = await listPayslips({
    branchId: context.branchId,
    query: parsed.data,
  });

  return NextResponse.json(successResponse(result));
}
