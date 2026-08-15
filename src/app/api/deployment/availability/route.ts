import { NextResponse } from "next/server";
import { z } from "zod";

import { getEmployeeAvailability } from "@/application/use-cases/get-employee-availability";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageDeployment } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

const availabilityQuerySchema = z.object({
  department: z.string().trim().optional(),
  designation: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageDeployment(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = availabilityQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const board = await getEmployeeAvailability(context.branchId, parsed.data);

  return NextResponse.json(successResponse(board));
}
