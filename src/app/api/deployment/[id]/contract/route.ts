import { NextResponse } from "next/server";

import { createDeploymentContractSchema } from "@/application/dto/deployment-contract.schema";
import {
  listDeploymentContractItems,
  uploadDeploymentContract,
} from "@/application/use-cases/upload-deployment-contract";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageDeployment } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageDeployment(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await params;
  const contracts = await listDeploymentContractItems(context.branchId, id);

  return NextResponse.json(successResponse(contracts));
}

export async function POST(request: Request, { params }: RouteParams) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageDeployment(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = createDeploymentContractSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await uploadDeploymentContract({
    branchId: context.branchId,
    deploymentId: id,
    userId: context.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.contract), { status: 201 });
}
