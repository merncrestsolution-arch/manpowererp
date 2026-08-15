import { mapCandidateToDetail } from "@/application/mappers/recruitment-mapper";
import { prisma } from "@/infrastructure/db/prisma";
import { formatCandidateNo, getNextSequenceValue } from "@/lib/sequence";

import type { CreateCandidateInput } from "@/application/dto/candidate.schema";
import type { CandidateDetail } from "@/types/recruitment";

type CreateCandidateParams = {
  branchId: string;
  userId: string;
  input: CreateCandidateInput;
};

type CreateCandidateResult =
  | { success: true; candidate: CandidateDetail }
  | { success: false; error: string };

export async function createCandidate({
  branchId,
  userId,
  input,
}: CreateCandidateParams): Promise<CreateCandidateResult> {
  const jobOpening = await prisma.jobOpening.findFirst({
    where: { id: input.jobOpeningId, branchId, deletedAt: null },
    select: { id: true, title: true },
  });

  if (!jobOpening) {
    return { success: false, error: "Job opening not found" };
  }

  try {
    const candidate = await prisma.$transaction(async (tx) => {
      const sequenceValue = await getNextSequenceValue(
        tx,
        branchId,
        "candidate_no",
      );
      const candidateNo = formatCandidateNo(sequenceValue);

      const created = await tx.candidate.create({
        data: {
          branchId,
          candidateNo,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email || null,
          phone: input.phone || null,
          nic: input.nic || null,
          jobOpeningId: input.jobOpeningId,
          appliedFor: input.appliedFor || jobOpening.title,
          source: input.source,
          resumeUrl: input.resumeUrl || null,
          status: "APPLIED",
          createdBy: userId,
          updatedBy: userId,
        },
        include: { jobOpening: { select: { title: true } } },
      });

      await tx.candidateStatusHistory.create({
        data: {
          candidateId: created.id,
          fromStatus: null,
          toStatus: "APPLIED",
          changedBy: userId,
          remarks: "Candidate created",
        },
      });

      return created;
    });

    return { success: true, candidate: mapCandidateToDetail(candidate) };
  } catch {
    return { success: false, error: "Failed to create candidate" };
  }
}
