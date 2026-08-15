import { NextResponse } from "next/server";

import { updateClientSchema } from "@/application/dto/client.schema";
import {
  deleteClient,
  restoreClient,
} from "@/application/use-cases/delete-client";
import { getClient } from "@/application/use-cases/get-client";
import { updateClient } from "@/application/use-cases/update-client";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import {
  canBlacklistClient,
  canManageClients,
  hasAdminAccess,
} from "@/infrastructure/auth/roles";
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

  const result = await getClient({
    branchId: authContext.branchId,
    clientId: id,
    includeDeleted: hasAdminAccess(authContext.role),
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 404 });
  }

  return NextResponse.json(successResponse(result.client));
}

export async function PATCH(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageClients(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = updateClientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await updateClient({
    branchId: authContext.branchId,
    clientId: id,
    userId: authContext.userId,
    input: parsed.data,
    canBlacklist: canBlacklistClient(authContext.role),
  });

  if (!result.success) {
    const status = result.error === "Forbidden" ? 403 : 404;
    return NextResponse.json(errorResponse(result.error), { status });
  }

  return NextResponse.json(successResponse(result.client));
}

export async function DELETE(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageClients(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "restore") {
    if (!hasAdminAccess(authContext.role)) {
      return NextResponse.json(errorResponse("Forbidden"), { status: 403 });
    }

    const result = await restoreClient({
      branchId: authContext.branchId,
      clientId: id,
      userId: authContext.userId,
    });

    if (!result.success) {
      return NextResponse.json(errorResponse(result.error), { status: 404 });
    }

    return NextResponse.json(successResponse({ restored: true }));
  }

  const result = await deleteClient({
    branchId: authContext.branchId,
    clientId: id,
    userId: authContext.userId,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 404 });
  }

  return NextResponse.json(successResponse({ deleted: true }));
}
