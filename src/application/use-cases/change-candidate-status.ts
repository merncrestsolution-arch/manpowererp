import { mapCandidateToDetail } from "@/application/mappers/recruitment-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { ChangeCandidateStatusInput } from "@/application/dto/candidate.schema";
import type { CandidateDetail } from "@/types/recruitment";

type ChangeCandidateStatusParams = {
  branchId: string;
  candidateId: string;
  userId: string;
  input: ChangeCandidateStatusInput;
};

type ChangeCandidateStatusResult =
  | { success: true; candidate: CandidateDetail }
  | { success: false; error: string };

export async function changeCandidateStatus({
  branchId,
  candidateId,
  userId,
  input,
}: ChangeCandidateStatusParams): Promise<ChangeCandidateStatusResult> {
  const existing = await prisma.candidate.findFirst({
    where: { id: candidateId, branchId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Candidate not found" };
  }

  if (existing.status === "PLACED") {
    return {
      success: false,
      error: "Cannot change status of a placed candidate",
    };
  }

  if (existing.status === input.status) {
    return { success: false, error: "Candidate is already in this status" };
  }

  const candidate = await prisma.$transaction(async (tx) => {
    const updated = await tx.candidate.update({
      where: { id: candidateId },
      data: {
        status: input.status,
        updatedBy: userId,
      },
      include: { jobOpening: { select: { title: true } } },
    });

    await tx.candidateStatusHistory.create({
      data: {
        candidateId,
        fromStatus: existing.status,
        toStatus: input.status,
        changedBy: userId,
        remarks: input.remarks || null,
      },
    });

    return updated;
  });

  return { success: true, candidate: mapCandidateToDetail(candidate) };
}
