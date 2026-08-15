import { NextResponse } from "next/server";

import {
  listSalaryComponentsQuerySchema,
  configureSalaryComponentSchema,
} from "@/application/dto/salary-component.schema";
import {
  configureSalaryComponent,
  listSalaryComponents,
} from "@/application/use-cases/configure-salary-component";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canConfigureSalaryComponents } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canConfigureSalaryComponents(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = listSalaryComponentsQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid query"),
      { status: 400 },
    );
  }

  const components = await listSalaryComponents({
    branchId: context.branchId,
    query: parsed.data,
  });

  return NextResponse.json(successResponse(components));
}

export async function POST(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context || !canConfigureSalaryComponents(context.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const body = await request.json();
  const parsed = configureSalaryComponentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await configureSalaryComponent({
    branchId: context.branchId,
    userId: context.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.component), { status: 201 });
}
