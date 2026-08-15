import { NextResponse } from "next/server";
import { z } from "zod";

import { getAttendanceSummaryReport } from "@/application/use-cases/get-attendance-summary-report";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canViewHrReports } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

const attendanceQuerySchema = z.object({
  dateFrom: z.string().min(1),
  dateTo: z.string().min(1),
});

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canViewHrReports(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = attendanceQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const report = await getAttendanceSummaryReport({
    branchId: context.branchId,
    dateFrom: parsed.data.dateFrom,
    dateTo: parsed.data.dateTo,
  });

  return NextResponse.json(successResponse(report));
}
