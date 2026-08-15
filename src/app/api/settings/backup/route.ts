import { NextResponse } from "next/server";

import { triggerBackup } from "@/application/use-cases/trigger-backup";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageSettings } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST() {
  const context = await getAuthenticatedContext();

  if (!context || !canManageSettings(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const result = await triggerBackup({
    branchId: context.branchId,
    userId: context.userId,
  });

  if (!result.success) {
    return NextResponse.json(
      successResponse({ backup: result.backup, error: result.error }),
      { status: 200 },
    );
  }

  return NextResponse.json(successResponse(result.backup));
}
