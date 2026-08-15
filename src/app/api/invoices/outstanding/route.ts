import { NextResponse } from "next/server";

import { getOutstandingReport } from "@/application/use-cases/get-outstanding-report";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageInvoices } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  const context = await getAuthenticatedContext();

  if (!context || !canManageInvoices(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const report = await getOutstandingReport(context.branchId);

  return NextResponse.json(successResponse(report));
}
