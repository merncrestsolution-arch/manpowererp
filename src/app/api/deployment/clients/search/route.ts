import { NextResponse } from "next/server";
import { z } from "zod";

import { searchClients } from "@/application/use-cases/search-clients";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageDeployment } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

const searchQuerySchema = z.object({
  q: z.string().trim().min(1),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageDeployment(context.role)) {
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

  const results = await searchClients({
    branchId: context.branchId,
    query: parsed.data.q,
    limit: parsed.data.limit,
  });

  return NextResponse.json(successResponse(results));
}
