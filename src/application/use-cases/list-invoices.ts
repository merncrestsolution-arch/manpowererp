import {
  buildInvoiceSearchFilter,
  mapInvoiceToDetail,
  mapInvoiceToListItem,
  parseInvoiceDate,
} from "@/application/mappers/invoice-mapper";
import { recalculateInvoiceStatus } from "@/application/use-cases/recalculate-invoice-status";
import { prisma } from "@/infrastructure/db/prisma";

import type { ListInvoicesQuery } from "@/application/dto/invoice.schema";
import type {
  InvoiceDetail,
  InvoiceFilterOptions,
  InvoiceListItem,
  PaginatedResult,
} from "@/types/invoice";

type ListInvoicesParams = {
  branchId: string;
  query: ListInvoicesQuery;
};

const listInclude = {
  client: { select: { companyName: true } },
} as const;

const detailInclude = {
  client: { select: { companyName: true, address: true } },
  quotation: { select: { quotationNo: true } },
  lineItems: true,
  payments: {
    include: { recordedBy: { select: { name: true } } },
  },
} as const;

export async function listInvoices({
  branchId,
  query,
}: ListInvoicesParams): Promise<PaginatedResult<InvoiceListItem>> {
  const {
    page,
    pageSize,
    search,
    clientId,
    status,
    dateFrom,
    dateTo,
    includeDeleted,
    sortBy,
    sortOrder,
  } = query;

  const parsedDateFrom = dateFrom ? parseInvoiceDate(dateFrom) : null;
  const parsedDateTo = dateTo ? parseInvoiceDate(dateTo) : null;

  const where = {
    branchId,
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(clientId ? { clientId } : {}),
    ...(status ? { status } : {}),
    ...(parsedDateFrom || parsedDateTo
      ? {
          issueDate: {
            ...(parsedDateFrom ? { gte: parsedDateFrom } : {}),
            ...(parsedDateTo ? { lte: parsedDateTo } : {}),
          },
        }
      : {}),
    ...buildInvoiceSearchFilter(search),
  };

  const [total, invoices] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      include: listInclude,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: invoices.map(mapInvoiceToListItem),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getInvoiceById(
  branchId: string,
  invoiceId: string,
): Promise<InvoiceDetail | null> {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, branchId, deletedAt: null },
    include: detailInclude,
  });

  if (!invoice) {
    return null;
  }

  const recalculated = recalculateInvoiceStatus({
    status: invoice.status,
    total: Number(invoice.total),
    amountPaid: Number(invoice.amountPaid),
    amountDue: Number(invoice.amountDue),
    dueDate: invoice.dueDate,
  });

  if (
    recalculated.status !== invoice.status ||
    recalculated.amountDue !== Number(invoice.amountDue)
  ) {
    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: recalculated.status,
        amountPaid: recalculated.amountPaid,
        amountDue: recalculated.amountDue,
      },
      include: detailInclude,
    });
    return mapInvoiceToDetail(updated);
  }

  return mapInvoiceToDetail(invoice);
}

export async function getInvoiceFilterOptions(
  branchId: string,
): Promise<InvoiceFilterOptions> {
  const clients = await prisma.client.findMany({
    where: { branchId, deletedAt: null },
    select: { id: true, companyName: true },
    orderBy: { companyName: "asc" },
  });

  return {
    clients: clients.map((client) => ({
      id: client.id,
      name: client.companyName,
    })),
    statuses: [
      "DRAFT",
      "SENT",
      "PARTIALLY_PAID",
      "PAID",
      "OVERDUE",
      "CANCELLED",
    ],
  };
}
