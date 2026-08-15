import { NextResponse } from "next/server";

import {
  listUserNotifications,
  markNotificationRead,
} from "@/application/use-cases/mobile-notifications";
import { requireMobileEmployee } from "@/infrastructure/auth/mobile-auth";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await requireMobileEmployee(request);

  if (!context) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");

  const result = await listUserNotifications(context.userId, page, pageSize);

  return NextResponse.json(successResponse(result));
}
