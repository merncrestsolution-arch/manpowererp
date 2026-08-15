import { NextResponse } from "next/server";

import { getEmployeeTodayAttendance } from "@/application/use-cases/list-attendance";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageEmployees } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";
import { resolveEmployeeForUser } from "@/lib/employee-context";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  if (!canManageEmployees(authContext.role)) {
    const selfEmployee = await resolveEmployeeForUser(
      authContext.branchId,
      authContext.userId,
    );

    if (!selfEmployee || selfEmployee.id !== id) {
      return NextResponse.json(errorResponse("Forbidden"), { status: 403 });
    }
  }

  const attendance = await getEmployeeTodayAttendance(authContext.branchId, id);

  if (!attendance) {
    return NextResponse.json(errorResponse("Employee not found"), {
      status: 404,
    });
  }

  return NextResponse.json(successResponse(attendance));
}
