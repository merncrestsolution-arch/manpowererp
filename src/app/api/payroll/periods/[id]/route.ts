import { NextResponse } from "next/server";

import { updatePayrollPeriodSchema } from "@/application/dto/payroll-period.schema";
import {
  deletePayrollPeriod,
  getPayrollPeriod,
  updatePayrollPeriod,
} from "@/application/use-cases/create-payroll-period";
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
  const period = await getPayrollPeriod(auth.branchId, id);

  if (!period) {
    return NextResponse.json(errorResponse("Payroll period not found"), {
      status: 404,
    });
  }

  return NextResponse.json(successResponse(period));
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canManagePayroll(auth.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updatePayrollPeriodSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await updatePayrollPeriod({
    branchId: auth.branchId,
    periodId: id,
    userId: auth.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.period));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canManagePayroll(auth.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const result = await deletePayrollPeriod({
    branchId: auth.branchId,
    periodId: id,
    userId: auth.userId,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error ?? "Delete failed"), {
      status: 400,
    });
  }

  return NextResponse.json(successResponse({ deleted: true }));
}
