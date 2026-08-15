import {
  buildClientSearchFilter,
  mapClientToListItem,
} from "@/application/mappers/client-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { ListClientsQuery } from "@/application/dto/client.schema";
import type {
  ClientFilterOptions,
  ClientListItem,
  PaginatedResult,
} from "@/types/client";

type ListClientsParams = {
  branchId: string;
  query: ListClientsQuery;
};

export async function listClients({
  branchId,
  query,
}: ListClientsParams): Promise<PaginatedResult<ClientListItem>> {
  const {
    page,
    pageSize,
    search,
    industry,
    city,
    status,
    includeDeleted,
    sortBy,
    sortOrder,
  } = query;

  const where = {
    branchId,
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(industry ? { industry } : {}),
    ...(city ? { city } : {}),
    ...(status ? { status } : {}),
    ...buildClientSearchFilter(search),
  };

  const [total, clients] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      include: {
        contacts: {
          where: { deletedAt: null },
          select: { name: true, isPrimary: true },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: clients.map(mapClientToListItem),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getClientFilterOptions(
  branchId: string,
): Promise<ClientFilterOptions> {
  const [industries, cities] = await Promise.all([
    prisma.client.findMany({
      where: { branchId, deletedAt: null, industry: { not: null } },
      select: { industry: true },
      distinct: ["industry"],
      orderBy: { industry: "asc" },
    }),
    prisma.client.findMany({
      where: { branchId, deletedAt: null, city: { not: null } },
      select: { city: true },
      distinct: ["city"],
      orderBy: { city: "asc" },
    }),
  ]);

  return {
    industries: industries
      .map((item) => item.industry)
      .filter((value): value is string => Boolean(value)),
    cities: cities
      .map((item) => item.city)
      .filter((value): value is string => Boolean(value)),
  };
}
