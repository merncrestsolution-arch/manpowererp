import { NextResponse } from "next/server";

import {
  endDeploymentSchema,
  reassignShiftSchema,
  updateDeploymentSchema,
} from "@/application/dto/deployment.schema";
import { endDeployment } from "@/application/use-cases/end-deployment";
import { reassignShift } from "@/application/use-cases/reassign-shift";
import {
  getDeployment,
  restoreDeployment,
  softDeleteDeployment,
  updateDeployment,
} from "@/application/use-cases/update-deployment";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import {
  canEndDeployment,
  canManageDeployment,
  canReassignShift,
  hasAdminAccess,
} from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageDeployment(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await params;
  const deployment = await getDeployment(context.branchId, id);

  if (!deployment) {
    return NextResponse.json(errorResponse("Deployment not found"), {
      status: 404,
    });
  }

  return NextResponse.json(successResponse(deployment));
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageDeployment(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateDeploymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await updateDeployment({
    branchId: context.branchId,
    deploymentId: id,
    userId: context.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.deployment));
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const context = await getAuthenticatedContext();

  if (!context || !hasAdminAccess(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const restore = searchParams.get("restore") === "true";

  const result = restore
    ? await restoreDeployment(context.branchId, id, context.userId)
    : await softDeleteDeployment(context.branchId, id, context.userId);

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(null));
}

export async function POST(request: Request, { params }: RouteParams) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const action = body.action as string;

  if (action === "end") {
    if (!canEndDeployment(context.role)) {
      return NextResponse.json(errorResponse("Forbidden"), { status: 403 });
    }

    const parsed = endDeploymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
        { status: 400 },
      );
    }

    const result = await endDeployment({
      branchId: context.branchId,
      deploymentId: id,
      userId: context.userId,
      input: parsed.data,
    });

    if (!result.success) {
      return NextResponse.json(errorResponse(result.error), { status: 400 });
    }

    return NextResponse.json(successResponse(result.deployment));
  }

  if (action === "reassign-shift") {
    if (!canReassignShift(context.role)) {
      return NextResponse.json(errorResponse("Forbidden"), { status: 403 });
    }

    const parsed = reassignShiftSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
        { status: 400 },
      );
    }

    const result = await reassignShift({
      branchId: context.branchId,
      deploymentId: id,
      userId: context.userId,
      input: parsed.data,
    });

    if (!result.success) {
      return NextResponse.json(errorResponse(result.error), { status: 400 });
    }

    return NextResponse.json(successResponse(result.deployment));
  }

  return NextResponse.json(errorResponse("Unknown action"), { status: 400 });
}
