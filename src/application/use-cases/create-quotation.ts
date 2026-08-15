import {
  calculateLineTotals,
  mapQuotationToDetail,
  parseInvoiceDate,
} from "@/application/mappers/invoice-mapper";
import { prisma } from "@/infrastructure/db/prisma";
import { formatQuotationNo, getNextSequenceValue } from "@/lib/sequence";

import type { CreateQuotationInput } from "@/application/dto/quotation.schema";
import type { QuotationDetail } from "@/types/invoice";

type CreateQuotationParams = {
  branchId: string;
  userId: string;
  input: CreateQuotationInput;
};

type CreateQuotationResult =
  | { success: true; quotation: QuotationDetail }
  | { success: false; error: string };

const detailInclude = {
  client: { select: { companyName: true } },
  lineItems: true,
} as const;

export async function createQuotation({
  branchId,
  userId,
  input,
}: CreateQuotationParams): Promise<CreateQuotationResult> {
  const issueDate = parseInvoiceDate(input.issueDate);
  const validUntil = parseInvoiceDate(input.validUntil);

  if (!issueDate || !validUntil) {
    return { success: false, error: "Invalid quotation dates" };
  }

  if (validUntil < issueDate) {
    return {
      success: false,
      error: "Valid until must be on or after issue date",
    };
  }

  const client = await prisma.client.findFirst({
    where: { id: input.clientId, branchId, deletedAt: null },
    select: { id: true },
  });

  if (!client) {
    return { success: false, error: "Client not found" };
  }

  const { computed, subtotal } = calculateLineTotals(input.lineItems);
  const taxAmount = Number(input.taxAmount ?? 0);
  const total = Number((subtotal + taxAmount).toFixed(2));

  try {
    const quotation = await prisma.$transaction(async (tx) => {
      const sequenceValue = await getNextSequenceValue(
        tx,
        branchId,
        "quotation_no",
      );
      const quotationNo = formatQuotationNo(sequenceValue);

      return tx.quotation.create({
        data: {
          branchId,
          quotationNo,
          clientId: input.clientId,
          issueDate,
          validUntil,
          status: input.status ?? "DRAFT",
          subtotal,
          taxAmount,
          total,
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

    return { success: true, quotation: mapQuotationToDetail(quotation) };
  } catch {
    return { success: false, error: "Failed to create quotation" };
  }
}
