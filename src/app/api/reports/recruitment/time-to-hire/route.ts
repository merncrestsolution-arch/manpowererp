import { NextResponse } from "next/server";

import { getTimeToHireReport } from "@/application/use-cases/get-time-to-hire-report";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canViewRecruitmentReports } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  const context = await getAuthenticatedContext();

  if (!context || !canViewRecruitmentReports(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const report = await getTimeToHireReport(context.branchId);
  return NextResponse.json(successResponse(report));
}
