import { NextResponse } from "next/server";

import { markNotificationRead } from "@/application/use-cases/mobile-notifications";
import { requireMobileEmployee } from "@/infrastructure/auth/mobile-auth";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const mobileContext = await requireMobileEmployee(request);

  if (!mobileContext) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const notification = await markNotificationRead(mobileContext.userId, id);

  if (!notification) {
    return NextResponse.json(errorResponse("Notification not found"), {
      status: 404,
    });
  }

  return NextResponse.json(successResponse(notification));
}
