import { NextResponse } from "next/server";

import { listBackupHistory } from "@/application/use-cases/trigger-backup";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageSettings } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  const context = await getAuthenticatedContext();

  if (!context || !canManageSettings(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const history = await listBackupHistory(context.branchId);
  return NextResponse.json(successResponse(history));
}
