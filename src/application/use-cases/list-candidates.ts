import {
  buildCandidateSearchFilter,
  mapCandidateToListItem,
  PIPELINE_STATUSES,
} from "@/application/mappers/recruitment-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { ListCandidatesQuery } from "@/application/dto/candidate.schema";
import type {
  CandidateListItem,
  CandidatePipelineColumn,
  PaginatedResult,
} from "@/types/recruitment";

export async function listCandidates({
  branchId,
  query,
}: {
  branchId: string;
  query: ListCandidatesQuery;
}): Promise<PaginatedResult<CandidateListItem>> {
  const {
    page,
    pageSize,
    search,
    status,
    source,
    jobOpeningId,
    includeDeleted,
    sortBy,
    sortOrder,
  } = query;

  const where = {
    branchId,
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(status ? { status } : {}),
    ...(source ? { source } : {}),
    ...(jobOpeningId ? { jobOpeningId } : {}),
    ...buildCandidateSearchFilter(search),
  };

  const [total, candidates] = await Promise.all([
    prisma.candidate.count({ where }),
    prisma.candidate.findMany({
      where,
      include: { jobOpening: { select: { title: true } } },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: candidates.map(mapCandidateToListItem),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getCandidatePipeline(
  branchId: string,
): Promise<CandidatePipelineColumn[]> {
  const candidates = await prisma.candidate.findMany({
    where: { branchId, deletedAt: null },
    include: { jobOpening: { select: { title: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const mapped = candidates.map(mapCandidateToListItem);

  return PIPELINE_STATUSES.map((status) => ({
    status,
    count: mapped.filter((item) => item.status === status).length,
    candidates: mapped.filter((item) => item.status === status),
  }));
}
