import { NextResponse } from "next/server";

import { forgotPasswordSchema } from "@/application/dto/forgot-password.schema";
import { requestPasswordReset } from "@/application/use-cases/request-password-reset";
import { checkRateLimit } from "@/infrastructure/auth/rate-limit";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = checkRateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      errorResponse("Too many requests. Please try again later."),
      { status: 429 },
    );
  }

  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const baseUrl =
    process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const result = await requestPasswordReset({
    email: parsed.data.email,
    baseUrl,
  });

  return NextResponse.json(successResponse({ message: result.message }));
}
