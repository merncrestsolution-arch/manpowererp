import {
  buildQuotationSearchFilter,
  mapQuotationToDetail,
  mapQuotationToListItem,
  parseInvoiceDate,
} from "@/application/mappers/invoice-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { ListQuotationsQuery } from "@/application/dto/quotation.schema";
import type {
  PaginatedResult,
  QuotationDetail,
  QuotationFilterOptions,
  QuotationListItem,
} from "@/types/invoice";

type ListQuotationsParams = {
  branchId: string;
  query: ListQuotationsQuery;
};

const listInclude = {
  client: { select: { companyName: true } },
} as const;

const detailInclude = {
  client: { select: { companyName: true } },
  lineItems: true,
} as const;

export async function listQuotations({
  branchId,
  query,
}: ListQuotationsParams): Promise<PaginatedResult<QuotationListItem>> {
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
    ...buildQuotationSearchFilter(search),
  };

  const [total, quotations] = await Promise.all([
    prisma.quotation.count({ where }),
    prisma.quotation.findMany({
      where,
      include: listInclude,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: quotations.map(mapQuotationToListItem),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getQuotationById(
  branchId: string,
  quotationId: string,
): Promise<QuotationDetail | null> {
  const quotation = await prisma.quotation.findFirst({
    where: { id: quotationId, branchId, deletedAt: null },
    include: detailInclude,
  });

  return quotation ? mapQuotationToDetail(quotation) : null;
}

export async function getQuotationFilterOptions(
  branchId: string,
): Promise<QuotationFilterOptions> {
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
    statuses: ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED", "CONVERTED"],
  };
}
