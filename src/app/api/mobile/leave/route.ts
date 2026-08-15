import { NextResponse } from "next/server";

import { createLeaveRequestSchema } from "@/application/dto/leave-request.schema";
import {
  createLeaveRequest,
  listEmployeeLeaveRequests,
} from "@/application/use-cases/create-leave-request";
import { requireMobileEmployee } from "@/infrastructure/auth/mobile-auth";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await requireMobileEmployee(request);

  if (!context) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const leaves = await listEmployeeLeaveRequests(
    context.branchId,
    context.employee.id,
  );

  return NextResponse.json(successResponse(leaves));
}

export async function POST(request: Request) {
  const context = await requireMobileEmployee(request);

  if (!context) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = createLeaveRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await createLeaveRequest({
    branchId: context.branchId,
    employeeId: context.employee.id,
    userId: context.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.leave), { status: 201 });
}
