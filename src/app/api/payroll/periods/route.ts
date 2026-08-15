import { NextResponse } from "next/server";

import {
  createPayrollPeriodSchema,
  listPayrollPeriodsQuerySchema,
} from "@/application/dto/payroll-period.schema";
import { createPayrollPeriod } from "@/application/use-cases/create-payroll-period";
import { listPayrollPeriods } from "@/application/use-cases/list-payroll-periods";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManagePayroll } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManagePayroll(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = listPayrollPeriodsQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const result = await listPayrollPeriods({
    branchId: context.branchId,
    query: parsed.data,
  });

  return NextResponse.json(successResponse(result));
}

export async function POST(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManagePayroll(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = createPayrollPeriodSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await createPayrollPeriod({
    branchId: context.branchId,
    userId: context.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.period), { status: 201 });
}
