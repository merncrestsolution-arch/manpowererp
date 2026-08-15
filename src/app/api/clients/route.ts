import { NextResponse } from "next/server";

import {
  createClientSchema,
  listClientsQuerySchema,
} from "@/application/dto/client.schema";
import { createClient } from "@/application/use-cases/create-client";
import {
  getClientFilterOptions,
  listClients,
} from "@/application/use-cases/list-clients";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageClients, hasAdminAccess } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageClients(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = listClientsQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const query = {
    ...parsed.data,
    includeDeleted:
      parsed.data.includeDeleted && hasAdminAccess(context.role) ? true : false,
  };

  const [result, filterOptions] = await Promise.all([
    listClients({ branchId: context.branchId, query }),
    getClientFilterOptions(context.branchId),
  ]);

  return NextResponse.json(
    successResponse({
      ...result,
      filterOptions,
    }),
  );
}

export async function POST(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageClients(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = createClientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  if (parsed.data.status === "BLACKLISTED" && !hasAdminAccess(context.role)) {
    return NextResponse.json(errorResponse("Forbidden"), { status: 403 });
  }

  const result = await createClient({
    branchId: context.branchId,
    userId: context.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.client), { status: 201 });
}
