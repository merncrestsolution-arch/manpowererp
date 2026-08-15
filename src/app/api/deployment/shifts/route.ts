import { NextResponse } from "next/server";

import { listBranchShiftsForDeployment } from "@/application/use-cases/search-clients";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageDeployment } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  const context = await getAuthenticatedContext();

  if (!context || !canManageDeployment(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const shifts = await listBranchShiftsForDeployment(context.branchId);

  return NextResponse.json(successResponse(shifts));
}
