import { NextResponse } from "next/server";

import { checkInSchema } from "@/application/dto/attendance.schema";
import { checkIn } from "@/application/use-cases/check-in";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = checkInSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await checkIn({
    branchId: context.branchId,
    userId: context.userId,
    role: context.role,
    employeeId: body.employeeId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.result), { status: 201 });
}
