import { NextResponse } from "next/server";

import { changeCandidateStatusSchema } from "@/application/dto/candidate.schema";
import { changeCandidateStatus } from "@/application/use-cases/change-candidate-status";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canChangeCandidateStatus } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canChangeCandidateStatus(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = changeCandidateStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await changeCandidateStatus({
    branchId: authContext.branchId,
    candidateId: id,
    userId: authContext.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.candidate));
}
