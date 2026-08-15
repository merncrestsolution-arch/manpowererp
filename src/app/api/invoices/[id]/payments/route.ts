import { NextResponse } from "next/server";

import { recordPaymentSchema } from "@/application/dto/payment.schema";
import { getInvoiceById } from "@/application/use-cases/list-invoices";
import { recordPayment } from "@/application/use-cases/record-payment";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canRecordPayments } from "@/infrastructure/auth/roles";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canRecordPayments(auth.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const invoice = await getInvoiceById(auth.branchId, id);

  if (!invoice) {
    return NextResponse.json(errorResponse("Invoice not found"), {
      status: 404,
    });
  }

  return NextResponse.json(successResponse(invoice.payments));
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canRecordPayments(auth.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = recordPaymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await recordPayment({
    branchId: auth.branchId,
    invoiceId: id,
    userId: auth.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  return NextResponse.json(successResponse(result.invoice), { status: 201 });
}
