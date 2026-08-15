import { NextResponse } from "next/server";

import { getMobileDashboard } from "@/application/use-cases/get-mobile-dashboard";
import { requireMobileEmployee } from "@/infrastructure/auth/mobile-auth";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await requireMobileEmployee(request);

  if (!context) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const dashboard = await getMobileDashboard({
    branchId: context.branchId,
    employeeId: context.employee.id,
    userId: context.userId,
  });

  if (!dashboard) {
    return NextResponse.json(errorResponse("Employee not found"), {
      status: 404,
    });
  }

  return NextResponse.json(successResponse(dashboard));
}
