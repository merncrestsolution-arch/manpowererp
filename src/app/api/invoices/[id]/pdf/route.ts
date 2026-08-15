import { readFile } from "node:fs/promises";

import { NextResponse } from "next/server";

import { getInvoiceById } from "@/application/use-cases/list-invoices";
import { getAuthenticatedContext } from "@/infrastructure/auth/api-auth";
import { canManageInvoices } from "@/infrastructure/auth/roles";
import { getInvoicePdfStoragePath } from "@/infrastructure/pdf/invoice-pdf-generator";
import {
  generateAndStoreInvoicePdf,
  getBillingPdfContext,
} from "@/infrastructure/pdf/quotation-pdf-generator";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await getAuthenticatedContext();

  if (!auth || !canManageInvoices(auth.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  let invoice = await getInvoiceById(auth.branchId, id);

  if (!invoice) {
    return new NextResponse("Invoice not found", { status: 404 });
  }

  try {
    const filePath = getInvoicePdfStoragePath(id);
    const pdfBytes = await readFile(filePath);

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNo}.pdf"`,
      },
    });
  } catch {
    const pdfContext = await getBillingPdfContext(auth.branchId);
    await generateAndStoreInvoicePdf(invoice, pdfContext);
    invoice = await getInvoiceById(auth.branchId, id);
    if (!invoice) {
      return new NextResponse("Invoice not found", { status: 404 });
    }

    const pdfBytes = await readFile(getInvoicePdfStoragePath(id));
    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNo}.pdf"`,
      },
    });
  }
}
