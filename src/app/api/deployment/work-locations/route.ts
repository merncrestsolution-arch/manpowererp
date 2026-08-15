import { NextResponse } from "next/server";

import {
  createWorkLocationSchema,
  listWorkLocationsQuerySchema,
} from "@/application/dto/work-location.schema";
import {
  createWorkLocation,
  listWorkLocations,
  listWorkLocationsByClient,
} from "@/application/use-cases/create-work-location";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import {
  canManageDeployment,
  hasAdminAccess,
} from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageDeployment(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  if (clientId && searchParams.get("mode") === "options") {
    const locations = await listWorkLocationsByClient(
      context.branchId,
      clientId,
    );
    return NextResponse.json(successResponse(locations));
  }

  const parsed = listWorkLocationsQuerySchema.safeParse(
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

  const result = await listWorkLocations({
    branchId: context.branchId,
    query,
  });

  return NextResponse.json(successResponse(result));
}

export async function POST(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageDeployment(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = createWorkLocationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await createWorkLocation({
    branchId: context.branchId,
    userId: context.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.workLocation), {
    status: 201,
  });
}
