import {
  calculateLineTotals,
  mapInvoiceToDetail,
  parseInvoiceDate,
} from "@/application/mappers/invoice-mapper";
import { postInvoiceJournal } from "@/application/use-cases/post-invoice-journal";
import { recalculateInvoiceStatus } from "@/application/use-cases/recalculate-invoice-status";
import { prisma } from "@/infrastructure/db/prisma";

import type { UpdateInvoiceInput } from "@/application/dto/invoice.schema";
import type { InvoiceDetail } from "@/types/invoice";

type UpdateInvoiceParams = {
  branchId: string;
  invoiceId: string;
  userId: string;
  input: UpdateInvoiceInput;
};

type UpdateInvoiceResult =
  { success: true; invoice: InvoiceDetail } | { success: false; error: string };

const detailInclude = {
  client: { select: { companyName: true, address: true } },
  quotation: { select: { quotationNo: true } },
  lineItems: true,
  payments: {
    include: { recordedBy: { select: { name: true } } },
  },
} as const;

export async function updateInvoice({
  branchId,
  invoiceId,
  userId,
  input,
}: UpdateInvoiceParams): Promise<UpdateInvoiceResult> {
  const existing = await prisma.invoice.findFirst({
    where: { id: invoiceId, branchId, deletedAt: null },
    include: { lineItems: true, payments: true },
  });

  if (!existing) {
    return { success: false, error: "Invoice not found" };
  }

  if (existing.status === "PAID" || existing.status === "CANCELLED") {
    return {
      success: false,
      error: "Paid or cancelled invoices cannot be edited",
    };
  }

  if (Number(existing.amountPaid) > 0 && input.lineItems) {
    return {
      success: false,
      error: "Cannot change line items after payments have been recorded",
    };
  }

  const issueDate = input.issueDate
    ? parseInvoiceDate(input.issueDate)
    : existing.issueDate;
  const dueDate = input.dueDate
    ? parseInvoiceDate(input.dueDate)
    : existing.dueDate;

  if (!issueDate || !dueDate) {
    return { success: false, error: "Invalid invoice dates" };
  }

  if (dueDate < issueDate) {
    return { success: false, error: "Due date must be on or after issue date" };
  }

  if (input.clientId) {
    const client = await prisma.client.findFirst({
      where: { id: input.clientId, branchId, deletedAt: null },
      select: { id: true },
    });
    if (!client) {
      return { success: false, error: "Client not found" };
    }
  }

  const lineItems =
    input.lineItems ??
    existing.lineItems.map((item) => ({
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    }));

  const { computed, subtotal } = calculateLineTotals(lineItems);
  const taxAmount =
    input.taxAmount !== undefined
      ? Number(input.taxAmount)
      : Number(existing.taxAmount);
  const total = Number((subtotal + taxAmount).toFixed(2));
  const amountPaid = Number(existing.amountPaid);

  const nextStatus = recalculateInvoiceStatus({
    status: input.status ?? existing.status,
    total,
    amountPaid,
    amountDue: total - amountPaid,
    dueDate,
  });

  try {
    const invoice = await prisma.$transaction(async (tx) => {
      if (input.lineItems) {
        await tx.invoiceLineItem.deleteMany({ where: { invoiceId } });
      }

      return tx.invoice.update({
        where: { id: invoiceId },
        data: {
          ...(input.clientId ? { clientId: input.clientId } : {}),
          issueDate,
          dueDate,
          status: nextStatus.status,
          subtotal,
          taxAmount,
          total,
          amountPaid: nextStatus.amountPaid,
          amountDue: nextStatus.amountDue,
          ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
          updatedBy: userId,
          ...(input.lineItems
            ? {
                lineItems: {
                  create: computed.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    lineTotal: item.lineTotal,
                    sortOrder: item.sortOrder,
                  })),
                },
              }
            : {}),
        },
        include: detailInclude,
      });
    });

    if (
      existing.status === "DRAFT" &&
      invoice.status !== "DRAFT" &&
      invoice.status !== "CANCELLED"
    ) {
      await postInvoiceJournal({
        branchId,
        userId,
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        issueDate: invoice.issueDate,
        total: Number(invoice.total),
        description: `Invoice ${invoice.invoiceNo} issued`,
      });
    }

    return { success: true, invoice: mapInvoiceToDetail(invoice) };
  } catch {
    return { success: false, error: "Failed to update invoice" };
  }
}
