import { NextResponse } from "next/server";

import { getHeadcountReport } from "@/application/use-cases/get-headcount-report";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canViewHrReports } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  const context = await getAuthenticatedContext();

  if (!context || !canViewHrReports(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const report = await getHeadcountReport(context.branchId);
  return NextResponse.json(successResponse(report));
}
