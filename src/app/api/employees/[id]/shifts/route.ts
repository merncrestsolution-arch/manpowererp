import { NextResponse } from "next/server";

import { assignEmployeeShiftSchema } from "@/application/dto/employee-shift.schema";
import {
  assignEmployeeShift,
  listBranchShifts,
  listEmployeeShifts,
} from "@/application/use-cases/assign-employee-shift";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageEmployees } from "@/infrastructure/auth/roles";
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

  const [assignments, availableShifts] = await Promise.all([
    listEmployeeShifts(authContext.branchId, id),
    listBranchShifts(authContext.branchId),
  ]);

  return NextResponse.json(
    successResponse({
      assignments,
      availableShifts,
    }),
  );
}

export async function POST(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageEmployees(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = assignEmployeeShiftSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await assignEmployeeShift({
    branchId: authContext.branchId,
    employeeId: id,
    userId: authContext.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.assignment), { status: 201 });
}
