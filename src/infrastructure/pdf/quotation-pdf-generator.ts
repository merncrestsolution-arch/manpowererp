import { prisma } from "@/infrastructure/db/prisma";
import { generateBillingPdf } from "@/infrastructure/pdf/invoice-pdf-generator";

import type { BillingPdfContext } from "@/infrastructure/pdf/invoice-pdf-generator";
import type { InvoiceDetail } from "@/types/invoice";

export async function generateAndStoreInvoicePdf(
  invoice: InvoiceDetail,
  context: BillingPdfContext,
): Promise<string> {
  const { pdfUrl } = await generateBillingPdf(
    {
      id: invoice.id,
      documentNo: invoice.invoiceNo,
      documentType: "INVOICE",
      clientName: invoice.clientName,
      clientAddress: invoice.clientAddress,
      issueDate: invoice.issueDate,
      secondaryDateLabel: "Due date",
      secondaryDate: invoice.dueDate,
      lineItems: invoice.lineItems,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      notes: invoice.notes,
      amountPaid: invoice.amountPaid,
      amountDue: invoice.amountDue,
    },
    context,
  );

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { pdfUrl },
  });

  return pdfUrl;
}

export async function generateAndStoreQuotationPdf(
  quotation: {
    id: string;
    quotationNo: string;
    clientName: string;
    clientAddress: string | null;
    issueDate: string;
    validUntil: string;
    lineItems: InvoiceDetail["lineItems"];
    subtotal: number;
    taxAmount: number;
    total: number;
    notes: string | null;
  },
  context: BillingPdfContext,
): Promise<string> {
  const { pdfUrl } = await generateBillingPdf(
    {
      id: quotation.id,
      documentNo: quotation.quotationNo,
      documentType: "QUOTATION",
      clientName: quotation.clientName,
      clientAddress: quotation.clientAddress,
      issueDate: quotation.issueDate,
      secondaryDateLabel: "Valid until",
      secondaryDate: quotation.validUntil,
      lineItems: quotation.lineItems,
      subtotal: quotation.subtotal,
      taxAmount: quotation.taxAmount,
      total: quotation.total,
      notes: quotation.notes,
    },
    context,
  );

  await prisma.quotation.update({
    where: { id: quotation.id },
    data: { pdfUrl },
  });

  return pdfUrl;
}

export async function getBillingPdfContext(
  branchId: string,
): Promise<BillingPdfContext> {
  const branch = await prisma.branch.findFirst({
    where: { id: branchId, deletedAt: null },
    include: { organization: { select: { name: true } } },
  });

  return {
    companyName: branch?.organization.name ?? "JK Manpower",
    branchName: branch?.name ?? "Head Office",
  };
}
