import { NextResponse } from "next/server";

import { reportPeriodQuerySchema } from "@/application/dto/account.schema";
import { getProfitAndLoss } from "@/application/use-cases/get-profit-and-loss";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageFinance } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canManageFinance(auth.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = reportPeriodQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const report = await getProfitAndLoss({
    branchId: auth.branchId,
    userId: auth.userId,
    dateFrom: parsed.data.dateFrom,
    dateTo: parsed.data.dateTo,
  });

  return NextResponse.json(successResponse(report));
}
