import { NextResponse } from "next/server";

import { getDashboardSummary } from "@/application/use-cases/get-dashboard-summary";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  const context = await getAuthenticatedContext();

  if (!context) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const summary = await getDashboardSummary(context.branchId);

  return NextResponse.json(successResponse(summary));
}
