import { NextResponse } from "next/server";

import { updateCompanySettingsSchema } from "@/application/dto/company-settings.schema";
import { seedPermissions } from "@/application/use-cases/seed-permissions";
import {
  getCompanySettings,
  updateCompanySettings,
} from "@/application/use-cases/update-company-settings";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageSettings } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  const context = await getAuthenticatedContext();

  if (!context || !canManageSettings(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  await seedPermissions(context.userId);
  const settings = await getCompanySettings(context.branchId);
  return NextResponse.json(successResponse(settings));
}

export async function PATCH(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canManageSettings(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = updateCompanySettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid input"),
      { status: 400 },
    );
  }

  const settings = await updateCompanySettings({
    branchId: context.branchId,
    userId: context.userId,
    input: parsed.data,
  });

  return NextResponse.json(successResponse(settings));
}
