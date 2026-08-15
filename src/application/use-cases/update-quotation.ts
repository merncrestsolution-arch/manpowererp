import {
  calculateLineTotals,
  mapQuotationToDetail,
  parseInvoiceDate,
} from "@/application/mappers/invoice-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { UpdateQuotationInput } from "@/application/dto/quotation.schema";
import type { QuotationDetail } from "@/types/invoice";

type UpdateQuotationParams = {
  branchId: string;
  quotationId: string;
  userId: string;
  input: UpdateQuotationInput;
};

type UpdateQuotationResult =
  | { success: true; quotation: QuotationDetail }
  | { success: false; error: string };

const detailInclude = {
  client: { select: { companyName: true } },
  lineItems: true,
} as const;

export async function updateQuotation({
  branchId,
  quotationId,
  userId,
  input,
}: UpdateQuotationParams): Promise<UpdateQuotationResult> {
  const existing = await prisma.quotation.findFirst({
    where: { id: quotationId, branchId, deletedAt: null },
    include: { lineItems: true },
  });

  if (!existing) {
    return { success: false, error: "Quotation not found" };
  }

  if (existing.status === "CONVERTED") {
    return { success: false, error: "Converted quotations cannot be edited" };
  }

  const issueDate = input.issueDate
    ? parseInvoiceDate(input.issueDate)
    : existing.issueDate;
  const validUntil = input.validUntil
    ? parseInvoiceDate(input.validUntil)
    : existing.validUntil;

  if (!issueDate || !validUntil) {
    return { success: false, error: "Invalid quotation dates" };
  }

  if (validUntil < issueDate) {
    return {
      success: false,
      error: "Valid until must be on or after issue date",
    };
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

  try {
    const quotation = await prisma.$transaction(async (tx) => {
      if (input.lineItems) {
        await tx.quotationLineItem.deleteMany({ where: { quotationId } });
      }

      return tx.quotation.update({
        where: { id: quotationId },
        data: {
          ...(input.clientId ? { clientId: input.clientId } : {}),
          issueDate,
          validUntil,
          ...(input.status ? { status: input.status } : {}),
          subtotal,
          taxAmount,
          total,
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

    return { success: true, quotation: mapQuotationToDetail(quotation) };
  } catch {
    return { success: false, error: "Failed to update quotation" };
  }
}
