import { NextResponse } from "next/server";

import {
  createEmployeeSchema,
  listEmployeesQuerySchema,
} from "@/application/dto/employee.schema";
import { createEmployee } from "@/application/use-cases/create-employee";
import {
  getEmployeeFilterOptions,
  listEmployees,
} from "@/application/use-cases/list-employees";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import {
  canManageEmployees,
  hasAdminAccess,
} from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageEmployees(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = listEmployeesQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const query = {
    ...parsed.data,
    includeDeleted:
      parsed.data.includeDeleted && hasAdminAccess(context.role) ? true : false,
  };

  const [result, filterOptions] = await Promise.all([
    listEmployees({ branchId: context.branchId, query }),
    getEmployeeFilterOptions(context.branchId),
  ]);

  return NextResponse.json(
    successResponse({
      ...result,
      filterOptions,
    }),
  );
}

export async function POST(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageEmployees(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = createEmployeeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await createEmployee({
    branchId: context.branchId,
    userId: context.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.employee), { status: 201 });
}
