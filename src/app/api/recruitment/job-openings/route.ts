import { NextResponse } from "next/server";

import {
  createJobOpeningSchema,
  listJobOpeningsQuerySchema,
} from "@/application/dto/job-opening.schema";
import {
  createJobOpening,
  getJobOpeningOptions,
  listInterviewers,
  listJobOpenings,
} from "@/application/use-cases/create-job-opening";
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
  const options = searchParams.get("options");
  const interviewers = searchParams.get("interviewers");

  if (options === "true") {
    const jobOptions = await getJobOpeningOptions(context.branchId);
    return NextResponse.json(successResponse(jobOptions));
  }

  if (interviewers === "true") {
    const interviewerList = await listInterviewers();
    return NextResponse.json(successResponse(interviewerList));
  }

  const parsed = listJobOpeningsQuerySchema.safeParse(
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

  const result = await listJobOpenings({
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
  const parsed = createJobOpeningSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await createJobOpening({
    branchId: context.branchId,
    userId: context.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.jobOpening), {
    status: 201,
  });
}
