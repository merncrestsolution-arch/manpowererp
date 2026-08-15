import {
  calculateLineTotals,
  mapInvoiceToDetail,
  parseInvoiceDate,
} from "@/application/mappers/invoice-mapper";
import { prisma } from "@/infrastructure/db/prisma";
import { formatInvoiceNo, getNextSequenceValue } from "@/lib/sequence";

import type { CreateInvoiceInput } from "@/application/dto/invoice.schema";
import type { InvoiceDetail } from "@/types/invoice";

type CreateInvoiceParams = {
  branchId: string;
  userId: string;
  input: CreateInvoiceInput;
};

type CreateInvoiceResult =
  { success: true; invoice: InvoiceDetail } | { success: false; error: string };

const detailInclude = {
  client: { select: { companyName: true, address: true } },
  quotation: { select: { quotationNo: true } },
  lineItems: true,
  payments: {
    include: { recordedBy: { select: { name: true } } },
  },
} as const;

export async function createInvoice({
  branchId,
  userId,
  input,
}: CreateInvoiceParams): Promise<CreateInvoiceResult> {
  const issueDate = parseInvoiceDate(input.issueDate);
  const dueDate = parseInvoiceDate(input.dueDate);

  if (!issueDate || !dueDate) {
    return { success: false, error: "Invalid invoice dates" };
  }

  if (dueDate < issueDate) {
    return { success: false, error: "Due date must be on or after issue date" };
  }

  const client = await prisma.client.findFirst({
    where: { id: input.clientId, branchId, deletedAt: null },
    select: { id: true },
  });

  if (!client) {
    return { success: false, error: "Client not found" };
  }

  if (input.quotationId) {
    const quotation = await prisma.quotation.findFirst({
      where: {
        id: input.quotationId,
        branchId,
        clientId: input.clientId,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!quotation) {
      return { success: false, error: "Quotation not found for this client" };
    }
  }

  const { computed, subtotal } = calculateLineTotals(input.lineItems);
  const taxAmount = Number(input.taxAmount ?? 0);
  const total = Number((subtotal + taxAmount).toFixed(2));

  try {
    const invoice = await prisma.$transaction(async (tx) => {
      const sequenceValue = await getNextSequenceValue(
        tx,
        branchId,
        "invoice_no",
      );
      const invoiceNo = formatInvoiceNo(sequenceValue);

      return tx.invoice.create({
        data: {
          branchId,
          invoiceNo,
          clientId: input.clientId,
          quotationId: input.quotationId || null,
          issueDate,
          dueDate,
          status: "DRAFT",
          subtotal,
          taxAmount,
          total,
          amountPaid: 0,
          amountDue: total,
          notes: input.notes || null,
          createdBy: userId,
          updatedBy: userId,
          lineItems: {
            create: computed.map((item) => ({
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
    });

    return { success: true, invoice: mapInvoiceToDetail(invoice) };
  } catch {
    return { success: false, error: "Failed to create invoice" };
  }
}
