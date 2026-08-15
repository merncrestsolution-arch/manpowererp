import { NextResponse } from "next/server";

import { listClientBillingHistory } from "@/application/use-cases/list-client-billing-history";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageClients } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageClients(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const records = await listClientBillingHistory(authContext.branchId, id);
  return NextResponse.json(successResponse(records));
}
