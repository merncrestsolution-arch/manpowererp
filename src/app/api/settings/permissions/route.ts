import { NextResponse } from "next/server";

import { updateRolePermissionSchema } from "@/application/dto/role-permission.schema";
import { seedPermissions } from "@/application/use-cases/seed-permissions";
import {
  getRolePermissionMatrix,
  updateRolePermission,
} from "@/application/use-cases/update-role-permission";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageSettings } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  const context = await getAuthenticatedContext();

  if (!context || !canManageSettings(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  await seedPermissions(context.userId);
  const matrix = await getRolePermissionMatrix();
  return NextResponse.json(successResponse(matrix));
}

export async function PATCH(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageSettings(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = updateRolePermissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid input"),
      { status: 400 },
    );
  }

  const result = await updateRolePermission({
    branchId: context.branchId,
    userId: context.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  const matrix = await getRolePermissionMatrix();
  return NextResponse.json(successResponse(matrix));
}
