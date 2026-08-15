import { NextResponse } from "next/server";

import { updateQuotationSchema } from "@/application/dto/quotation.schema";
import { getQuotationById } from "@/application/use-cases/list-quotations";
import { updateQuotation } from "@/application/use-cases/update-quotation";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageInvoices, hasAdminAccess } from "@/infrastructure/auth/roles";
import { prisma } from "@/infrastructure/db/prisma";
import {
  generateAndStoreQuotationPdf,
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
  const quotation = await getQuotationById(auth.branchId, id);

  if (!quotation) {
    return NextResponse.json(errorResponse("Quotation not found"), {
      status: 404,
    });
  }

  return NextResponse.json(successResponse(quotation));
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canManageInvoices(auth.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateQuotationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(parsed.error.issues[0]?.message ?? "Invalid request"),
      { status: 400 },
    );
  }

  const result = await updateQuotation({
    branchId: auth.branchId,
    quotationId: id,
    userId: auth.userId,
    input: parsed.data,
  });

  if (!result.success) {
    return NextResponse.json(errorResponse(result.error), { status: 400 });
  }

  if (parsed.data.status === "SENT" || parsed.data.lineItems) {
    const client = await prisma.client.findFirst({
      where: { id: result.quotation.clientId },
      select: { address: true },
    });
    const pdfContext = await getBillingPdfContext(auth.branchId);
    await generateAndStoreQuotationPdf(
      {
        ...result.quotation,
        clientAddress: client?.address ?? null,
      },
      pdfContext,
    );
  }

  return NextResponse.json(successResponse(result.quotation));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !hasAdminAccess(auth.role)) {
    return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
  }

  const { id } = await context.params;

  const quotation = await prisma.quotation.findFirst({
    where: { id, branchId: auth.branchId, deletedAt: null },
  });

  if (!quotation) {
    return NextResponse.json(errorResponse("Quotation not found"), {
      status: 404,
    });
  }

  await prisma.quotation.update({
    where: { id },
    data: { deletedAt: new Date(), updatedBy: auth.userId },
  });

  return NextResponse.json(successResponse({ id }));
}
