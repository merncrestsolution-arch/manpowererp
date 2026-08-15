import { NextResponse } from "next/server";

import { balanceSheetQuerySchema } from "@/application/dto/account.schema";
import { getBalanceSheet } from "@/application/use-cases/get-balance-sheet";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageFinance } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canManageFinance(auth.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = balanceSheetQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const report = await getBalanceSheet({
    branchId: auth.branchId,
    userId: auth.userId,
    asOfDate: parsed.data.asOfDate,
  });

  return NextResponse.json(successResponse(report));
}
