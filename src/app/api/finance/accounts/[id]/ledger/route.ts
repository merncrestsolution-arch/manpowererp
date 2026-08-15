import { NextResponse } from "next/server";

import { ledgerQuerySchema } from "@/application/dto/account.schema";
import { getLedgerForAccount } from "@/application/use-cases/get-ledger-for-account";
import { getAccountById } from "@/application/use-cases/list-accounts";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageFinance } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canManageFinance(auth.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const account = await getAccountById(auth.branchId, id);

  if (!account) {
    return NextResponse.json(errorResponse("Account not found"), {
      status: 404,
    });
  }

  const { searchParams } = new URL(request.url);
  const parsed = ledgerQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const ledger = await getLedgerForAccount({
    branchId: auth.branchId,
    accountId: id,
    dateFrom: parsed.data.dateFrom,
    dateTo: parsed.data.dateTo,
  });

  return NextResponse.json(
    successResponse({
      account,
      ...ledger,
    }),
  );
}
