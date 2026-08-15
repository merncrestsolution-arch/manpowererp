import type {
  InvoiceDetail,
  InvoiceListItem,
  LineItemDetail,
  PaymentListItem,
  QuotationDetail,
  QuotationListItem,
} from "@/types/invoice";
import type {
  InvoiceLineItem,
  Payment,
  Prisma,
  QuotationLineItem,
} from "@prisma/client";

type QuotationListInclude = Prisma.QuotationGetPayload<{
  include: {
    client: { select: { companyName: true } };
  };
}>;

type QuotationDetailInclude = Prisma.QuotationGetPayload<{
  include: {
    client: { select: { companyName: true } };
    lineItems: true;
  };
}>;

type InvoiceListInclude = Prisma.InvoiceGetPayload<{
  include: {
    client: { select: { companyName: true } };
  };
}>;

type InvoiceDetailInclude = Prisma.InvoiceGetPayload<{
  include: {
    client: { select: { companyName: true; address: true } };
    quotation: { select: { quotationNo: true } };
    lineItems: true;
    payments: {
      include: {
        recordedBy: { select: { name: true } };
      };
    };
  };
}>;

export function parseInvoiceDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function calculateLineTotals(
  lineItems: { description: string; quantity: number; unitPrice: number }[],
) {
  const computed = lineItems.map((item, index) => {
    const lineTotal = Number((item.quantity * item.unitPrice).toFixed(2));
    return {
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal,
      sortOrder: index,
    };
  });

  const subtotal = Number(
    computed.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2),
  );

  return { computed, subtotal };
}

export function mapQuotationLineItem(item: QuotationLineItem): LineItemDetail {
  return {
    id: item.id,
    description: item.description,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    lineTotal: Number(item.lineTotal),
    sortOrder: item.sortOrder,
  };
}

export function mapInvoiceLineItem(item: InvoiceLineItem): LineItemDetail {
  return {
    id: item.id,
    description: item.description,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    lineTotal: Number(item.lineTotal),
    sortOrder: item.sortOrder,
  };
}

export function mapQuotationToListItem(
  quotation: QuotationListInclude,
): QuotationListItem {
  return {
    id: quotation.id,
    quotationNo: quotation.quotationNo,
    clientId: quotation.clientId,
    clientName: quotation.client.companyName,
    issueDate: quotation.issueDate.toISOString(),
    validUntil: quotation.validUntil.toISOString(),
    status: quotation.status,
    total: Number(quotation.total),
    createdAt: quotation.createdAt.toISOString(),
  };
}

export function mapQuotationToDetail(
  quotation: QuotationDetailInclude,
): QuotationDetail {
  return {
    id: quotation.id,
    quotationNo: quotation.quotationNo,
    clientId: quotation.clientId,
    clientName: quotation.client.companyName,
    issueDate: quotation.issueDate.toISOString(),
    validUntil: quotation.validUntil.toISOString(),
    status: quotation.status,
    subtotal: Number(quotation.subtotal),
    taxAmount: Number(quotation.taxAmount),
    total: Number(quotation.total),
    notes: quotation.notes,
    pdfUrl: quotation.pdfUrl,
    lineItems: quotation.lineItems
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(mapQuotationLineItem),
    createdAt: quotation.createdAt.toISOString(),
    updatedAt: quotation.updatedAt.toISOString(),
  };
}

export function mapInvoiceToListItem(
  invoice: InvoiceListInclude,
): InvoiceListItem {
  return {
    id: invoice.id,
    invoiceNo: invoice.invoiceNo,
    clientId: invoice.clientId,
    clientName: invoice.client.companyName,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    status: invoice.status,
    total: Number(invoice.total),
    amountPaid: Number(invoice.amountPaid),
    amountDue: Number(invoice.amountDue),
    createdAt: invoice.createdAt.toISOString(),
  };
}

export function mapPaymentToListItem(
  payment: Payment & { recordedBy: { name: string } },
): PaymentListItem {
  return {
    id: payment.id,
    paymentNo: payment.paymentNo,
    amount: Number(payment.amount),
    paymentDate: payment.paymentDate.toISOString(),
    method: payment.method,
    reference: payment.reference,
    recordedById: payment.recordedById,
    recordedByName: payment.recordedBy.name,
    createdAt: payment.createdAt.toISOString(),
  };
}

export function mapInvoiceToDetail(
  invoice: InvoiceDetailInclude,
): InvoiceDetail {
  return {
    id: invoice.id,
    invoiceNo: invoice.invoiceNo,
    clientId: invoice.clientId,
    clientName: invoice.client.companyName,
    clientAddress: invoice.client.address,
    quotationId: invoice.quotationId,
    quotationNo: invoice.quotation?.quotationNo ?? null,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    status: invoice.status,
    subtotal: Number(invoice.subtotal),
    taxAmount: Number(invoice.taxAmount),
    total: Number(invoice.total),
    amountPaid: Number(invoice.amountPaid),
    amountDue: Number(invoice.amountDue),
    notes: invoice.notes,
    pdfUrl: invoice.pdfUrl,
    lineItems: invoice.lineItems
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(mapInvoiceLineItem),
    payments: invoice.payments
      .sort(
        (a, b) =>
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
      )
      .map(mapPaymentToListItem),
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
  };
}

export function buildInvoiceSearchFilter(search?: string) {
  if (!search) {
    return {};
  }

  return {
    OR: [
      { invoiceNo: { contains: search, mode: "insensitive" as const } },
      {
        client: {
          companyName: { contains: search, mode: "insensitive" as const },
        },
      },
    ],
  };
}

export function buildQuotationSearchFilter(search?: string) {
  if (!search) {
    return {};
  }

  return {
    OR: [
      { quotationNo: { contains: search, mode: "insensitive" as const } },
      {
        client: {
          companyName: { contains: search, mode: "insensitive" as const },
        },
      },
    ],
  };
}

export function getBillingPeriod(issueDate: Date) {
  const periodStart = new Date(
    Date.UTC(issueDate.getUTCFullYear(), issueDate.getUTCMonth(), 1),
  );
  const periodEnd = new Date(
    Date.UTC(
      issueDate.getUTCFullYear(),
      issueDate.getUTCMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    ),
  );
  return { periodStart, periodEnd };
}
