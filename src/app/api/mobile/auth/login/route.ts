import { NextResponse } from "next/server";

import { loginSchema } from "@/application/dto/login.schema";
import { loginUser } from "@/application/use-cases/login-user";
import { checkRateLimit } from "@/infrastructure/auth/rate-limit";
import { createMobileToken } from "@/infrastructure/auth/mobile-token";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const rateLimit = checkRateLimit(
    `mobile-login:${parsed.data.email.toLowerCase()}`,
    5,
    15 * 60 * 1000,
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      errorResponse("Too many requests. Please try again later."),
      { status: 429 },
    );
  }

  const result = await loginUser({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse("Invalid email or password"), {
      status: 401,
    });
  }

  const token = await createMobileToken(
    {
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
    },
    parsed.data.rememberMe,
  );

  return NextResponse.json(
    successResponse({
      token,
      user: result.user,
    }),
  );
}
