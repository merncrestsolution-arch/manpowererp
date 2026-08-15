import { NextResponse } from "next/server";

import { approveOvertimeSchema } from "@/application/dto/overtime.schema";
import { approveOvertime } from "@/application/use-cases/approve-overtime";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canApproveOvertime } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canApproveOvertime(authContext.role)) {
    return NextResponse.json(errorResponse("Forbidden"), { status: 403 });
  }

  const body = await request.json();
  const parsed = approveOvertimeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await approveOvertime({
    branchId: authContext.branchId,
    overtimeId: id,
    approverId: authContext.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.overtime));
}
