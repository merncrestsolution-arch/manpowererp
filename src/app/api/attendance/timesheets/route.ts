import { NextResponse } from "next/server";

import { timesheetQuerySchema } from "@/application/dto/attendance.schema";
import {
  getEmployeeTimesheet,
  listEmployeeTimesheets,
} from "@/application/use-cases/get-employee-timesheet";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageAttendance, hasHrAccess } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";
import { resolveEmployeeForUser } from "@/lib/employee-context";

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = timesheetQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  if (parsed.data.employeeId) {
    if (!canManageAttendance(context.role) && !hasHrAccess(context.role)) {
      const selfEmployee = await resolveEmployeeForUser(
        context.branchId,
        context.userId,
      );

      if (!selfEmployee || selfEmployee.id !== parsed.data.employeeId) {
        return NextResponse.json(errorResponse("Forbidden"), { status: 403 });
      }
    }

    const result = await getEmployeeTimesheet({
      branchId: context.branchId,
      query: parsed.data,
    });

    if (!result.success) {
      return NextResponse.json(errorResponse(result.error), { status: 400 });
    }

    return NextResponse.json(successResponse(result.timesheet));
  }

  if (!canManageAttendance(context.role)) {
    return NextResponse.json(errorResponse("Forbidden"), { status: 403 });
  }

  const summaries = await listEmployeeTimesheets(context.branchId, parsed.data);

  return NextResponse.json(successResponse(summaries));
}
