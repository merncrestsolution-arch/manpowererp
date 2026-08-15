import { NextResponse } from "next/server";

import { assignEmployeeSalaryComponentSchema } from "@/application/dto/employee-salary-component.schema";
import {
  assignEmployeeSalaryComponent,
  listEmployeeSalaryComponents,
} from "@/application/use-cases/assign-employee-salary-component";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import {
  canConfigureSalaryComponents,
  canManageEmployees,
  canManagePayroll,
} from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (
    !auth ||
    (!canManageEmployees(auth.role) && !canManagePayroll(auth.role))
  ) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const assignments = await listEmployeeSalaryComponents(auth.branchId, id);

  return NextResponse.json(successResponse({ assignments }));
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canConfigureSalaryComponents(auth.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = assignEmployeeSalaryComponentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await assignEmployeeSalaryComponent({
    branchId: auth.branchId,
    employeeId: id,
    userId: auth.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.assignment), { status: 201 });
}
