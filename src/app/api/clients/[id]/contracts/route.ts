import { NextResponse } from "next/server";

import {
  createClientContractSchema,
  updateClientContractSchema,
} from "@/application/dto/client-contract.schema";
import {
  createClientContract,
  listClientContracts,
  updateClientContract,
} from "@/application/use-cases/create-client-contract";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import {
  canManageClients,
  canTerminateContract,
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

  const contracts = await listClientContracts(authContext.branchId, id);
  return NextResponse.json(successResponse(contracts));
}

export async function POST(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageClients(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = createClientContractSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await createClientContract({
    branchId: authContext.branchId,
    clientId: id,
    userId: authContext.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.contract), { status: 201 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageClients(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = updateClientContractSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const { contractId, ...input } = parsed.data;
  const result = await updateClientContract({
    branchId: authContext.branchId,
    clientId: id,
    contractId,
    userId: authContext.userId,
    input,
    canTerminate: canTerminateContract(authContext.role),
  });

  if (!result.success) {
    const status = result.error === "Forbidden" ? 403 : 404;
    return NextResponse.json(errorResponse(result.error), { status });
  }

  return NextResponse.json(successResponse(result.contract));
}
