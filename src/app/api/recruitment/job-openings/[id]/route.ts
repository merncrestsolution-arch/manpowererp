import { NextResponse } from "next/server";

import { updateJobOpeningSchema } from "@/application/dto/job-opening.schema";
import {
  getJobOpening,
  updateJobOpening,
} from "@/application/use-cases/create-job-opening";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageRecruitment } from "@/infrastructure/auth/roles";
import { prisma } from "@/infrastructure/db/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageRecruitment(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const result = await getJobOpening({
    branchId: authContext.branchId,
    jobOpeningId: id,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 404 });
  }

  return NextResponse.json(successResponse(result.jobOpening));
}

export async function PATCH(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageRecruitment(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = updateJobOpeningSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await updateJobOpening({
    branchId: authContext.branchId,
    jobOpeningId: id,
    userId: authContext.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 404 });
  }

  return NextResponse.json(successResponse(result.jobOpening));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageRecruitment(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const existing = await prisma.jobOpening.findFirst({
    where: { id, branchId: authContext.branchId, deletedAt: null },
  });

  if (!existing) {
    return NextResponse.json(errorResponse("Job opening not found"), {
      status: 404,
    });
  }

  await prisma.jobOpening.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      updatedBy: authContext.userId,
    },
  });

  return NextResponse.json(successResponse({ deleted: true }));
}
