import { NextResponse } from "next/server";

import { getRevenueTrend } from "@/application/use-cases/get-revenue-trend";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  const context = await getAuthenticatedContext();

  if (!context) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const trend = await getRevenueTrend(context.branchId);

  return NextResponse.json(successResponse(trend));
}
