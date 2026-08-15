import { NextResponse } from "next/server";

import { requestPasswordReset } from "@/application/use-cases/request-password-reset";
import { getUser } from "@/application/use-cases/update-user";
import { auditLogger } from "@/infrastructure/audit/audit-logger";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageSettings } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";
import { resolveOrganizationIdForBranch } from "@/lib/organization";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageSettings(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await params;
  const user = await getUser({ branchId: context.branchId, targetUserId: id });

  if (!user) {
    return NextResponse.json(errorResponse("User not found"), { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const result = await requestPasswordReset({
    email: user.email,
    baseUrl: origin,
  });

  const organizationId = await resolveOrganizationIdForBranch(context.branchId);

  await auditLogger({
    organizationId,
    branchId: context.branchId,
    userId: context.userId,
    action: "FORCE_PASSWORD_RESET",
    entityType: "User",
    entityId: id,
  });

  return NextResponse.json(successResponse({ message: result.message }));
}
