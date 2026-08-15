import { NextResponse } from "next/server";

import {
  createLeaveRequestSchema,
  updateLeaveStatusSchema,
} from "@/application/dto/leave-request.schema";
import {
  createLeaveRequest,
  listEmployeeLeaveRequests,
} from "@/application/use-cases/create-leave-request";
import { updateLeaveStatus } from "@/application/use-cases/update-leave-status";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import {
  canApproveLeave,
  canManageEmployees,
} from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageEmployees(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const leaves = await listEmployeeLeaveRequests(authContext.branchId, id);

  return NextResponse.json(successResponse(leaves));
}

export async function POST(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageEmployees(authContext.role)) {
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
    branchId: authContext.branchId,
    employeeId: id,
    userId: authContext.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.leave), { status: 201 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canApproveLeave(authContext.role)) {
    return NextResponse.json(errorResponse("Forbidden"), { status: 403 });
  }

  const body = await request.json();
  const statusParsed = updateLeaveStatusSchema.safeParse(body);

  if (!statusParsed.success) {
    return NextResponse.json(
      errorResponse(statusParsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const leaveId = body.leaveId as string | undefined;

  if (!leaveId) {
    return NextResponse.json(errorResponse("Leave ID is required"), {
      status: 400,
    });
  }

  const result = await updateLeaveStatus({
    branchId: authContext.branchId,
    employeeId: id,
    leaveId,
    approverId: authContext.userId,
    input: statusParsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.leave));
}
