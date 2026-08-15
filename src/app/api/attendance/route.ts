import { NextResponse } from "next/server";

import { listAttendanceQuerySchema } from "@/application/dto/attendance.schema";
import { listAttendance } from "@/application/use-cases/list-attendance";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageAttendance } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageAttendance(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = listAttendanceQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const result = await listAttendance(context.branchId, parsed.data);

  return NextResponse.json(successResponse(result));
}
