import { NextResponse } from "next/server";

import {
  createAccountSchema,
  listAccountsQuerySchema,
} from "@/application/dto/account.schema";
import { createAccount } from "@/application/use-cases/create-account";
import { listAccounts } from "@/application/use-cases/list-accounts";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageFinance, hasAdminAccess } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageFinance(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = listAccountsQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const accounts = await listAccounts({
    branchId: context.branchId,
    search: parsed.data.search,
    type: parsed.data.type,
    isActive: parsed.data.isActive,
    includeDeleted:
      parsed.data.includeDeleted && hasAdminAccess(context.role) ? true : false,
  });

  return NextResponse.json(successResponse(accounts));
}

export async function POST(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageFinance(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = createAccountSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await createAccount({
    branchId: context.branchId,
    userId: context.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.account), { status: 201 });
}
