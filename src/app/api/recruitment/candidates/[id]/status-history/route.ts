import { NextResponse } from "next/server";

import { listCandidateStatusHistory } from "@/application/use-cases/list-candidate-status-history";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageRecruitment } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageRecruitment(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const history = await listCandidateStatusHistory(authContext.branchId, id);
  return NextResponse.json(successResponse(history));
}
