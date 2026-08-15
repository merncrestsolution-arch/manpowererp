import { NextResponse } from "next/server";

import { updateEmployeeSchema } from "@/application/dto/employee.schema";
import {
  deleteEmployee,
  restoreEmployee,
} from "@/application/use-cases/delete-employee";
import { getEmployee } from "@/application/use-cases/get-employee";
import { updateEmployee } from "@/application/use-cases/update-employee";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import {
  canManageEmployees,
  hasAdminAccess,
} from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageEmployees(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const result = await getEmployee({
    branchId: authContext.branchId,
    employeeId: id,
    includeDeleted: hasAdminAccess(authContext.role),
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 404 });
  }

  return NextResponse.json(successResponse(result.employee));
}

export async function PATCH(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageEmployees(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = updateEmployeeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await updateEmployee({
    branchId: authContext.branchId,
    employeeId: id,
    userId: authContext.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 404 });
  }

  return NextResponse.json(successResponse(result.employee));
}

export async function DELETE(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageEmployees(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "restore") {
    if (!hasAdminAccess(authContext.role)) {
      return NextResponse.json(errorResponse("Forbidden"), { status: 403 });
    }

    const result = await restoreEmployee({
      branchId: authContext.branchId,
      employeeId: id,
      userId: authContext.userId,
    });

    if (!result.success) {
      return NextResponse.json(errorResponse(result.error), { status: 404 });
    }

    return NextResponse.json(successResponse({ restored: true }));
  }

  const result = await deleteEmployee({
    branchId: authContext.branchId,
    employeeId: id,
    userId: authContext.userId,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 404 });
  }

  return NextResponse.json(successResponse({ deleted: true }));
}
