import { NextResponse } from "next/server";

import { listPayslipsQuerySchema } from "@/application/dto/employee-salary-component.schema";
import { listPayslips } from "@/application/use-cases/run-payroll";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManagePayroll } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManagePayroll(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = listPayslipsQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

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
