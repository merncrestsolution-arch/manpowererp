import { NextResponse } from "next/server";

import { updateInvoiceSchema } from "@/application/dto/invoice.schema";
import { getInvoiceById } from "@/application/use-cases/list-invoices";
import { updateInvoice } from "@/application/use-cases/update-invoice";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageInvoices, hasAdminAccess } from "@/infrastructure/auth/roles";
import { prisma } from "@/infrastructure/db/prisma";
import {
  generateAndStoreInvoicePdf,
  getBillingPdfContext,
} from "@/infrastructure/pdf/quotation-pdf-generator";
import { errorResponse, successResponse } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canManageInvoices(auth.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const invoice = await getInvoiceById(auth.branchId, id);

  if (!invoice) {
    return NextResponse.json(errorResponse("Invoice not found"), {
      status: 404,
    });
  }

  return NextResponse.json(successResponse(invoice));
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canManageInvoices(auth.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateInvoiceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await updateInvoice({
    branchId: auth.branchId,
    invoiceId: id,
    userId: auth.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  if (parsed.data.status === "SENT" || parsed.data.lineItems) {
    const pdfContext = await getBillingPdfContext(auth.branchId);
    await generateAndStoreInvoicePdf(result.invoice, pdfContext);
  }

  return NextResponse.json(successResponse(result.invoice));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !hasAdminAccess(auth.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;

  const invoice = await prisma.invoice.findFirst({
    where: { id, branchId: auth.branchId, deletedAt: null },
  });

  if (!invoice) {
    return NextResponse.json(errorResponse("Invoice not found"), {
      status: 404,
    });
  }

  await prisma.invoice.update({
    where: { id },
    data: { deletedAt: new Date(), updatedBy: auth.userId },
  });

  return NextResponse.json(successResponse({ id }));
}
