import { NextResponse } from "next/server";

import { getRecruitmentFunnelReport } from "@/application/use-cases/get-recruitment-funnel-report";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canViewRecruitmentReports } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  const context = await getAuthenticatedContext();

  if (!context || !canViewRecruitmentReports(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const report = await getRecruitmentFunnelReport(context.branchId);
  return NextResponse.json(successResponse(report));
}
