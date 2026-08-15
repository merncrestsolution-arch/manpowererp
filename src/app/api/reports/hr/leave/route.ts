import { NextResponse } from "next/server";

import { reportDateRangeQuerySchema } from "@/application/dto/reports.schema";
import { getLeaveUtilizationReport } from "@/application/use-cases/get-leave-utilization-report";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canViewHrReports } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canViewHrReports(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = reportDateRangeQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const report = await getLeaveUtilizationReport({
    branchId: context.branchId,
    dateFrom: parsed.data.dateFrom,
    dateTo: parsed.data.dateTo,
  });

  return NextResponse.json(successResponse(report));
}
