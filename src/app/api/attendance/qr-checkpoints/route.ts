import { NextResponse } from "next/server";

import { generateQrCheckpointSchema } from "@/application/dto/attendance.schema";
import {
  generateQrCheckpoint,
  listQrCheckpoints,
} from "@/application/use-cases/generate-qr-checkpoint";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageAttendance } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  const context = await getAuthenticatedContext();

  if (!context || !canManageAttendance(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const checkpoints = await listQrCheckpoints(context.branchId);

  return NextResponse.json(successResponse(checkpoints));
}

export async function POST(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageAttendance(context.role)) {
    return NextResponse.json(errorResponse("Forbidden"), { status: 403 });
  }

  const body = await request.json();
  const parsed = generateQrCheckpointSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await generateQrCheckpoint({
    branchId: context.branchId,
    userId: context.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.checkpoint), { status: 201 });
}
