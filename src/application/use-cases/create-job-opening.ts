import {
  buildJobOpeningSearchFilter,
  mapJobOpeningToDetail,
  mapJobOpeningToListItem,
} from "@/application/mappers/recruitment-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type {
  CreateJobOpeningInput,
  ListJobOpeningsQuery,
  UpdateJobOpeningInput,
} from "@/application/dto/job-opening.schema";
import type {
  JobOpeningDetail,
  JobOpeningListItem,
  JobOpeningOption,
  PaginatedResult,
} from "@/types/recruitment";

export async function createJobOpening({
  branchId,
  userId,
  input,
}: {
  branchId: string;
  userId: string;
  input: CreateJobOpeningInput;
}): Promise<
  | { success: true; jobOpening: JobOpeningDetail }
  | { success: false; error: string }
> {
  if (input.clientId) {
    const client = await prisma.client.findFirst({
      where: { id: input.clientId, branchId, deletedAt: null },
    });

    if (!client) {
      return { success: false, error: "Client not found" };
    }
  }

  const jobOpening = await prisma.jobOpening.create({
    data: {
      branchId,
      title: input.title,
      department: input.department || null,
      clientId: input.clientId || null,
      positionsAvailable: input.positionsAvailable,
      status: input.status,
      createdBy: userId,
      updatedBy: userId,
    },
    include: { client: { select: { companyName: true } } },
  });

  return { success: true, jobOpening: mapJobOpeningToDetail(jobOpening) };
}

export async function updateJobOpening({
  branchId,
  jobOpeningId,
  userId,
  input,
}: {
  branchId: string;
  jobOpeningId: string;
  userId: string;
  input: UpdateJobOpeningInput;
}): Promise<
  | { success: true; jobOpening: JobOpeningDetail }
  | { success: false; error: string }
> {
  const existing = await prisma.jobOpening.findFirst({
    where: { id: jobOpeningId, branchId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Job opening not found" };
  }

  if (input.clientId) {
    const client = await prisma.client.findFirst({
      where: { id: input.clientId, branchId, deletedAt: null },
    });

    if (!client) {
      return { success: false, error: "Client not found" };
    }
  }

  const jobOpening = await prisma.jobOpening.update({
    where: { id: jobOpeningId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.department !== undefined
        ? { department: input.department || null }
        : {}),
      ...(input.clientId !== undefined
        ? { clientId: input.clientId || null }
        : {}),
      ...(input.positionsAvailable !== undefined
        ? { positionsAvailable: input.positionsAvailable }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      updatedBy: userId,
    },
    include: { client: { select: { companyName: true } } },
  });

  return { success: true, jobOpening: mapJobOpeningToDetail(jobOpening) };
}

export async function getJobOpening({
  branchId,
  jobOpeningId,
  includeDeleted = false,
}: {
  branchId: string;
  jobOpeningId: string;
  includeDeleted?: boolean;
}): Promise<
  | { success: true; jobOpening: JobOpeningDetail }
  | { success: false; error: string }
> {
  const jobOpening = await prisma.jobOpening.findFirst({
    where: {
      id: jobOpeningId,
      branchId,
      ...(includeDeleted ? {} : { deletedAt: null }),
    },
    include: { client: { select: { companyName: true } } },
  });

  if (!jobOpening) {
    return { success: false, error: "Job opening not found" };
  }

  return { success: true, jobOpening: mapJobOpeningToDetail(jobOpening) };
}

export async function listJobOpenings({
  branchId,
  query,
}: {
  branchId: string;
  query: ListJobOpeningsQuery;
}): Promise<PaginatedResult<JobOpeningListItem>> {
  const { page, pageSize, search, status, includeDeleted, sortBy, sortOrder } =
    query;

  const where = {
    branchId,
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(status ? { status } : {}),
    ...buildJobOpeningSearchFilter(search),
  };

  const [total, openings] = await Promise.all([
    prisma.jobOpening.count({ where }),
    prisma.jobOpening.findMany({
      where,
      include: {
        client: { select: { companyName: true } },
        _count: { select: { candidates: { where: { deletedAt: null } } } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: openings.map(mapJobOpeningToListItem),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getJobOpeningOptions(
  branchId: string,
): Promise<JobOpeningOption[]> {
  const openings = await prisma.jobOpening.findMany({
    where: { branchId, deletedAt: null, status: "OPEN" },
    select: { id: true, title: true, department: true },
    orderBy: { title: "asc" },
  });

  return openings;
}

export async function listInterviewers(): Promise<
  Array<{ id: string; name: string; email: string }>
> {
  return prisma.user.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      role: { in: ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "RECRUITER"] },
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}
