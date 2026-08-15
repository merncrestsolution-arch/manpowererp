import { mapInvoiceToDetail } from "@/application/mappers/invoice-mapper";
import { postInvoiceJournal } from "@/application/use-cases/post-invoice-journal";
import { prisma } from "@/infrastructure/db/prisma";
import { formatInvoiceNo, getNextSequenceValue } from "@/lib/sequence";

import type { InvoiceDetail } from "@/types/invoice";

type ConvertQuotationParams = {
  branchId: string;
  quotationId: string;
  userId: string;
  dueDate?: string;
};

type ConvertQuotationResult =
  { success: true; invoice: InvoiceDetail } | { success: false; error: string };

const detailInclude = {
  client: { select: { companyName: true, address: true } },
  quotation: { select: { quotationNo: true } },
  lineItems: true,
  payments: {
    include: { recordedBy: { select: { name: true } } },
  },
} as const;

export async function convertQuotationToInvoice({
  branchId,
  quotationId,
  userId,
  dueDate,
}: ConvertQuotationParams): Promise<ConvertQuotationResult> {
  const quotation = await prisma.quotation.findFirst({
    where: { id: quotationId, branchId, deletedAt: null },
    include: {
      client: { select: { creditTermDays: true } },
      lineItems: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!quotation) {
    return { success: false, error: "Quotation not found" };
  }

  if (quotation.status === "CONVERTED") {
    return { success: false, error: "Quotation has already been converted" };
  }

  if (quotation.status === "REJECTED" || quotation.status === "EXPIRED") {
    return {
      success: false,
      error: "Rejected or expired quotations cannot be converted",
    };
  }

  const parsedDueDate = dueDate ? new Date(dueDate) : null;
  const invoiceDueDate =
    parsedDueDate && !Number.isNaN(parsedDueDate.getTime())
      ? parsedDueDate
      : new Date(quotation.issueDate);
  if (!dueDate) {
    invoiceDueDate.setDate(
      invoiceDueDate.getDate() + quotation.client.creditTermDays,
    );
  }

  try {
    const invoice = await prisma.$transaction(async (tx) => {
      const sequenceValue = await getNextSequenceValue(
        tx,
        branchId,
        "invoice_no",
      );
      const invoiceNo = formatInvoiceNo(sequenceValue);
      const total = Number(quotation.total);

      const created = await tx.invoice.create({
        data: {
          branchId,
          invoiceNo,
          clientId: quotation.clientId,
          quotationId: quotation.id,
          issueDate: new Date(),
          dueDate: invoiceDueDate,
          status: "SENT",
          subtotal: quotation.subtotal,
          taxAmount: quotation.taxAmount,
          total,
          amountPaid: 0,
          amountDue: total,
          notes: quotation.notes,
          createdBy: userId,
          updatedBy: userId,
          lineItems: {
            create: quotation.lineItems.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
              sortOrder: item.sortOrder,
            })),
          },
        },
        include: detailInclude,
      });

      await tx.quotation.update({
        where: { id: quotationId },
        data: { status: "CONVERTED", updatedBy: userId },
      });

      return created;
    });

    await postInvoiceJournal({
      branchId,
      userId,
      invoiceId: invoice.id,
      invoiceNo: invoice.invoiceNo,
      issueDate: invoice.issueDate,
      total: Number(invoice.total),
      description: `Invoice ${invoice.invoiceNo} from quotation ${quotation.quotationNo}`,
    });

    return { success: true, invoice: mapInvoiceToDetail(invoice) };
  } catch {
    return { success: false, error: "Failed to convert quotation to invoice" };
  }
}
