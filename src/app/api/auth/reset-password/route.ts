import { NextResponse } from "next/server";

import { resetPasswordSchema } from "@/application/dto/reset-password.schema";
import { resetPassword } from "@/application/use-cases/reset-password";
import { checkRateLimit } from "@/infrastructure/auth/rate-limit";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = checkRateLimit(`reset-password:${ip}`, 10, 15 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      errorResponse("Too many requests. Please try again later."),
      { status: 429 },
    );
  }

  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await resetPassword({
    token: parsed.data.token,
    password: parsed.data.password,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse({ message: "Password updated" }));
}
