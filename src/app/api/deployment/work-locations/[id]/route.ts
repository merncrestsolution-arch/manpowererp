import { NextResponse } from "next/server";

import { updateWorkLocationSchema } from "@/application/dto/work-location.schema";
import {
  getWorkLocation,
  softDeleteWorkLocation,
  updateWorkLocation,
} from "@/application/use-cases/create-work-location";
import { getShiftCoverage } from "@/application/use-cases/reassign-shift";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageDeployment } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageDeployment(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);

  if (searchParams.get("view") === "shift-coverage") {
    const coverage = await getShiftCoverage(context.branchId, id);

    if (!coverage) {
      return NextResponse.json(errorResponse("Work location not found"), {
        status: 404,
      });
    }

    return NextResponse.json(successResponse(coverage));
  }

  const workLocation = await getWorkLocation(context.branchId, id);

  if (!workLocation) {
    return NextResponse.json(errorResponse("Work location not found"), {
      status: 404,
    });
  }

  return NextResponse.json(successResponse(workLocation));
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageDeployment(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateWorkLocationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await updateWorkLocation({
    branchId: context.branchId,
    workLocationId: id,
    userId: context.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.workLocation));
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageDeployment(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await params;
  const result = await softDeleteWorkLocation(
    context.branchId,
    id,
    context.userId,
  );

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(null));
}
