import { NextResponse } from "next/server";

import {
  getBearerToken,
  createMobileToken,
  verifyMobileToken,
} from "@/infrastructure/auth/mobile-token";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const payload = await verifyMobileToken(token);

  if (!payload) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const rememberMe = Boolean(body.rememberMe);

  const newToken = await createMobileToken(
    {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    },
    rememberMe,
  );

  return NextResponse.json(successResponse({ token: newToken }));
}
