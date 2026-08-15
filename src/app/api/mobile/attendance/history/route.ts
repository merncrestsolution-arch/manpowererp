import { NextResponse } from "next/server";

import { timesheetQuerySchema } from "@/application/dto/attendance.schema";
import { getEmployeeTimesheet } from "@/application/use-cases/get-employee-timesheet";
import { requireMobileEmployee } from "@/infrastructure/auth/mobile-auth";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await requireMobileEmployee(request);

  if (!context) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = timesheetQuerySchema.safeParse({
    ...Object.fromEntries(searchParams.entries()),
    employeeId: context.employee.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
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
