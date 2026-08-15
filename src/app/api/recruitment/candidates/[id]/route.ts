import { NextResponse } from "next/server";

import { updateCandidateSchema } from "@/application/dto/candidate.schema";
import {
  deleteCandidate,
  getCandidate,
  restoreCandidate,
} from "@/application/use-cases/get-candidate";
import { updateCandidate } from "@/application/use-cases/update-candidate";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import {
  canManageRecruitment,
  hasAdminAccess,
} from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageRecruitment(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const result = await getCandidate({
    branchId: authContext.branchId,
    candidateId: id,
    includeDeleted: hasAdminAccess(authContext.role),
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 404 });
  }

  return NextResponse.json(successResponse(result.candidate));
}

export async function PATCH(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageRecruitment(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = updateCandidateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await updateCandidate({
    branchId: authContext.branchId,
    candidateId: id,
    userId: authContext.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 404 });
  }

  return NextResponse.json(successResponse(result.candidate));
}

export async function DELETE(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageRecruitment(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "restore") {
    if (!hasAdminAccess(authContext.role)) {
      return NextResponse.json(errorResponse("Forbidden"), { status: 403 });
    }

    const result = await restoreCandidate({
      branchId: authContext.branchId,
      candidateId: id,
      userId: authContext.userId,
    });

    if (!result.success) {
      return NextResponse.json(errorResponse(result.error), { status: 404 });
    }

    return NextResponse.json(successResponse({ restored: true }));
  }

  const result = await deleteCandidate({
    branchId: authContext.branchId,
    candidateId: id,
    userId: authContext.userId,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 404 });
  }

  return NextResponse.json(successResponse({ deleted: true }));
}
