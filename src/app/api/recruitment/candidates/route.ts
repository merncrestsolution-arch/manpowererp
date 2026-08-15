import { NextResponse } from "next/server";

import {
  createCandidateSchema,
  listCandidatesQuerySchema,
} from "@/application/dto/candidate.schema";
import { createCandidate } from "@/application/use-cases/create-candidate";
import {
  getCandidatePipeline,
  listCandidates,
} from "@/application/use-cases/list-candidates";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import {
  canManageRecruitment,
  hasAdminAccess,
} from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageRecruitment(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");

  if (view === "pipeline") {
    const pipeline = await getCandidatePipeline(context.branchId);
    return NextResponse.json(successResponse(pipeline));
  }

  const parsed = listCandidatesQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const query = {
    ...parsed.data,
    includeDeleted:
      parsed.data.includeDeleted && hasAdminAccess(context.role) ? true : false,
  };

  const result = await listCandidates({
    branchId: context.branchId,
    query,
  });

  return NextResponse.json(successResponse(result));
}

export async function POST(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageRecruitment(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = createCandidateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await createCandidate({
    branchId: context.branchId,
    userId: context.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.candidate), { status: 201 });
}
