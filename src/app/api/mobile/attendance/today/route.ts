import { NextResponse } from "next/server";

import { getEmployeeTodayAttendance } from "@/application/use-cases/list-attendance";
import { requireMobileEmployee } from "@/infrastructure/auth/mobile-auth";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await requireMobileEmployee(request);

  if (!context) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const attendance = await getEmployeeTodayAttendance(
    context.branchId,
    context.employee.id,
  );

  return NextResponse.json(
    successResponse(
      attendance ?? {
        status: "NOT_RECORDED",
        checkInTime: null,
        checkOutTime: null,
        workingHoursPercent: 0,
      },
    ),
  );
}
