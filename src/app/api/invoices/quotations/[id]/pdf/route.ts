import { readFile } from "node:fs/promises";

import { NextResponse } from "next/server";

import { getQuotationById } from "@/application/use-cases/list-quotations";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageInvoices } from "@/infrastructure/auth/roles";
import { prisma } from "@/infrastructure/db/prisma";
import { getQuotationPdfStoragePath } from "@/infrastructure/pdf/invoice-pdf-generator";
import {
  generateAndStoreQuotationPdf,
  getBillingPdfContext,
} from "@/infrastructure/pdf/quotation-pdf-generator";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canManageInvoices(auth.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  let quotation = await getQuotationById(auth.branchId, id);

  if (!quotation) {
    return new NextResponse("Quotation not found", { status: 404 });
  }

  try {
    const pdfBytes = await readFile(getQuotationPdfStoragePath(id));

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${quotation.quotationNo}.pdf"`,
      },
    });
  } catch {
    const client = await prisma.client.findFirst({
      where: { id: quotation!.clientId },
      select: { address: true },
    });
    const pdfContext = await getBillingPdfContext(auth.branchId);
    await generateAndStoreQuotationPdf(
      {
        ...quotation!,
        clientAddress: client?.address ?? null,
      },
      pdfContext,
    );
    quotation = await getQuotationById(auth.branchId, id);
    if (!quotation) {
      return new NextResponse("Quotation not found", { status: 404 });
    }

    const pdfBytes = await readFile(getQuotationPdfStoragePath(id));
    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${quotation.quotationNo}.pdf"`,
      },
    });
  }
}
