import { mapCandidateToDetail } from "@/application/mappers/recruitment-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { CandidateDetail } from "@/types/recruitment";

export async function getCandidate({
  branchId,
  candidateId,
  includeDeleted = false,
}: {
  branchId: string;
  candidateId: string;
  includeDeleted?: boolean;
}): Promise<
  | { success: true; candidate: CandidateDetail }
  | { success: false; error: string }
> {
  const candidate = await prisma.candidate.findFirst({
    where: {
      id: candidateId,
      branchId,
      ...(includeDeleted ? {} : { deletedAt: null }),
    },
    include: { jobOpening: { select: { title: true } } },
  });

  if (!candidate) {
    return { success: false, error: "Candidate not found" };
  }

  return { success: true, candidate: mapCandidateToDetail(candidate) };
}

export async function deleteCandidate({
  branchId,
  candidateId,
  userId,
}: {
  branchId: string;
  candidateId: string;
  userId: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const existing = await prisma.candidate.findFirst({
    where: { id: candidateId, branchId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Candidate not found" };
  }

  await prisma.candidate.update({
    where: { id: candidateId },
    data: { deletedAt: new Date(), updatedBy: userId },
  });

  return { success: true };
}

export async function restoreCandidate({
  branchId,
  candidateId,
  userId,
}: {
  branchId: string;
  candidateId: string;
  userId: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const existing = await prisma.candidate.findFirst({
    where: { id: candidateId, branchId, deletedAt: { not: null } },
  });

  if (!existing) {
    return { success: false, error: "Deleted candidate not found" };
  }

  await prisma.candidate.update({
    where: { id: candidateId },
    data: { deletedAt: null, updatedBy: userId },
  });

  return { success: true };
}
