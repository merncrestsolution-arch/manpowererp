import { NextResponse } from "next/server";

import { placeCandidateSchema } from "@/application/dto/place-candidate.schema";
import { placeCandidate } from "@/application/use-cases/place-candidate";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canPlaceCandidate } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authContext = await getAuthenticatedContext();
  const { id } = await context.params;

  if (!authContext || !canPlaceCandidate(authContext.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = placeCandidateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await placeCandidate({
    branchId: authContext.branchId,
    candidateId: id,
    userId: authContext.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(
    successResponse({
      candidate: result.candidate,
      employee: result.employee,
    }),
    { status: 201 },
  );
}
