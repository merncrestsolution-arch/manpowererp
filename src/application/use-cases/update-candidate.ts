import { mapCandidateToDetail } from "@/application/mappers/recruitment-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { UpdateCandidateInput } from "@/application/dto/candidate.schema";
import type { CandidateDetail } from "@/types/recruitment";

type UpdateCandidateParams = {
  branchId: string;
  candidateId: string;
  userId: string;
  input: UpdateCandidateInput;
};

type UpdateCandidateResult =
  | { success: true; candidate: CandidateDetail }
  | { success: false; error: string };

export async function updateCandidate({
  branchId,
  candidateId,
  userId,
  input,
}: UpdateCandidateParams): Promise<UpdateCandidateResult> {
  const existing = await prisma.candidate.findFirst({
    where: { id: candidateId, branchId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Candidate not found" };
  }

  if (existing.status === "PLACED") {
    return { success: false, error: "Cannot edit a placed candidate" };
  }

  if (input.jobOpeningId) {
    const jobOpening = await prisma.jobOpening.findFirst({
      where: { id: input.jobOpeningId, branchId, deletedAt: null },
    });

    if (!jobOpening) {
      return { success: false, error: "Job opening not found" };
    }
  }

  const candidate = await prisma.candidate.update({
    where: { id: candidateId },
    data: {
      ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
      ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
      ...(input.email !== undefined ? { email: input.email || null } : {}),
      ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
      ...(input.nic !== undefined ? { nic: input.nic || null } : {}),
      ...(input.jobOpeningId !== undefined
        ? { jobOpeningId: input.jobOpeningId }
        : {}),
      ...(input.appliedFor !== undefined
        ? { appliedFor: input.appliedFor || null }
        : {}),
      ...(input.source !== undefined ? { source: input.source } : {}),
      ...(input.resumeUrl !== undefined
        ? { resumeUrl: input.resumeUrl || null }
        : {}),
      updatedBy: userId,
    },
    include: { jobOpening: { select: { title: true } } },
  });

  return { success: true, candidate: mapCandidateToDetail(candidate) };
}
