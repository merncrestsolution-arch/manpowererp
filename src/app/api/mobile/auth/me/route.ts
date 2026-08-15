import { NextResponse } from "next/server";

import { getMobileProfile } from "@/infrastructure/auth/mobile-auth";
import {
  getBearerToken,
  verifyMobileToken,
} from "@/infrastructure/auth/mobile-token";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const payload = await verifyMobileToken(token);

  if (!payload) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const profile = await getMobileProfile(request);

  if (!profile) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  return NextResponse.json(
    successResponse({
      id: profile.userId,
      email: payload.email,
      name: payload.name,
      role: profile.role,
      branchId: profile.branchId,
      employee: profile.employee,
      deployment: profile.deployment,
    }),
  );
}
