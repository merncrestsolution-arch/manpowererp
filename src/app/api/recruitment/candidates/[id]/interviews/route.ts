import { NextResponse } from "next/server";

import {
  recordInterviewOutcomeSchema,
  scheduleInterviewSchema,
} from "@/application/dto/interview.schema";
import { recordInterviewOutcome } from "@/application/use-cases/record-interview-outcome";
import {
  listCandidateInterviews,
  scheduleInterview,
} from "@/application/use-cases/schedule-interview";
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

  const interviews = await listCandidateInterviews(authContext.branchId, id);
  return NextResponse.json(successResponse(interviews));
}

export async function POST(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageRecruitment(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = scheduleInterviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await scheduleInterview({
    branchId: authContext.branchId,
    candidateId: id,
    userId: authContext.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.interview), { status: 201 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageRecruitment(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = recordInterviewOutcomeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await recordInterviewOutcome({
    branchId: authContext.branchId,
    candidateId: id,
    userId: authContext.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.interview));
}
