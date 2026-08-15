import { NextResponse } from "next/server";

import {
  registerDeviceSchema,
  registerDeviceToken,
  unregisterDeviceToken,
} from "@/application/use-cases/mobile-notifications";
import { requireMobileEmployee } from "@/infrastructure/auth/mobile-auth";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST(request: Request) {
  const context = await requireMobileEmployee(request);

  if (!context) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = registerDeviceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  await registerDeviceToken(context.userId, parsed.data);

  return NextResponse.json(successResponse({ registered: true }));
}

export async function DELETE(request: Request) {
  const context = await requireMobileEmployee(request);

  if (!context) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const token = body.token as string | undefined;

  if (!token) {
    return NextResponse.json(errorResponse("Token is required"), {
      status: 400,
    });
  }

  await unregisterDeviceToken(context.userId, token);

  return NextResponse.json(successResponse({ unregistered: true }));
}
