import { NextResponse } from "next/server";
import { z } from "zod";

import { convertQuotationToInvoice } from "@/application/use-cases/convert-quotation-to-invoice";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canConvertQuotation } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

const convertSchema = z.object({
  dueDate: z.string().optional(),
});

export async function POST(request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canConvertQuotation(auth.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = convertSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await convertQuotationToInvoice({
    branchId: auth.branchId,
    quotationId: id,
    userId: auth.userId,
    dueDate: parsed.data.dueDate,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.invoice), { status: 201 });
}
