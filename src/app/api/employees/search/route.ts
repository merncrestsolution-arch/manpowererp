import { NextResponse } from "next/server";
import { z } from "zod";

import { searchEmployees } from "@/application/use-cases/search-employees";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import {
  canManageClients,
  canManageDeployment,
  canManageEmployees,
} from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

const searchQuerySchema = z.object({
  q: z.string().trim().min(1),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (
    !context ||
    (!canManageClients(context.role) &&
      !canManageEmployees(context.role) &&
      !canManageDeployment(context.role))
  ) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = searchQuerySchema.safeParse({
    q: searchParams.get("q") ?? "",
    limit: searchParams.get("limit") ?? "10",
  });

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const results = await searchEmployees({
    branchId: context.branchId,
    query: parsed.data.q,
    limit: parsed.data.limit,
  });

  return NextResponse.json(successResponse(results));
}
