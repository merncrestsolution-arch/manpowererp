import { NextResponse } from "next/server";

import {
  assignWorkerToClientSchema,
  endWorkerAssignmentSchema,
} from "@/application/dto/client-worker-assignment.schema";
import {
  assignWorkerToClient,
  listClientWorkerAssignments,
} from "@/application/use-cases/assign-worker-to-client";
import { endWorkerAssignment } from "@/application/use-cases/end-worker-assignment";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageClients } from "@/infrastructure/auth/roles";
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

  const assignments = await listClientWorkerAssignments(
    authContext.branchId,
    id,
  );

  return NextResponse.json(successResponse(assignments));
}

export async function POST(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageClients(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = assignWorkerToClientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await assignWorkerToClient({
    branchId: authContext.branchId,
    clientId: id,
    userId: authContext.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.assignment), {
    status: 201,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canManageClients(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = endWorkerAssignmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await endWorkerAssignment({
    branchId: authContext.branchId,
    clientId: id,
    userId: authContext.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 404 });
  }

  return NextResponse.json(successResponse(result.assignment));
}
