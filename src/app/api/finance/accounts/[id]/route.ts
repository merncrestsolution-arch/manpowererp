import { NextResponse } from "next/server";

import { updateAccountSchema } from "@/application/dto/account.schema";
import { getAccountById } from "@/application/use-cases/list-accounts";
import { updateAccount } from "@/application/use-cases/update-account";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageFinance } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
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

  return NextResponse.json(successResponse(account));
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canManageFinance(auth.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateAccountSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await updateAccount({
    branchId: auth.branchId,
    accountId: id,
    userId: auth.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.account));
}
