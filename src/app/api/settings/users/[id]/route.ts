import { NextResponse } from "next/server";

import { updateUserSchema } from "@/application/dto/user.schema";
import { deactivateUser } from "@/application/use-cases/deactivate-user";
import { getUser, updateUser } from "@/application/use-cases/update-user";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageSettings } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageSettings(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await params;
  const user = await getUser({ branchId: context.branchId, targetUserId: id });

  if (!user) {
    return NextResponse.json(errorResponse("User not found"), { status: 404 });
  }

  return NextResponse.json(successResponse(user));
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageSettings(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid input"),
      { status: 400 },
    );
  }

  const result = await updateUser({
    branchId: context.branchId,
    userId: context.userId,
    targetUserId: id,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.user));
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageSettings(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await params;
  const result = await deactivateUser({
    branchId: context.branchId,
    userId: context.userId,
    targetUserId: id,
    isActive: false,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse({ deactivated: true }));
}
