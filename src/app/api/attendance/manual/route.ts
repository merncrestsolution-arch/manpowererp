import { NextResponse } from "next/server";

import { manualAttendanceSchema } from "@/application/dto/manual-attendance.schema";
import { recordManualAttendance } from "@/application/use-cases/record-manual-attendance";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManualAttendanceEntry } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManualAttendanceEntry(context.role)) {
    return NextResponse.json(errorResponse("Forbidden"), { status: 403 });
  }

  const body = await request.json();
  const parsed = manualAttendanceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await recordManualAttendance({
    branchId: context.branchId,
    userId: context.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.attendance), { status: 201 });
}
