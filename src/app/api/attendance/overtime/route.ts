import { NextResponse } from "next/server";

import { listOvertimeQuerySchema } from "@/application/dto/overtime.schema";
import { listOvertimeRecords } from "@/application/use-cases/approve-overtime";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canApproveOvertime } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canApproveOvertime(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = listOvertimeQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const result = await listOvertimeRecords(context.branchId, parsed.data);

  return NextResponse.json(successResponse(result));
}
