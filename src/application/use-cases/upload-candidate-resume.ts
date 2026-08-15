import { mapCandidateToDetail } from "@/application/mappers/recruitment-mapper";
import { prisma } from "@/infrastructure/db/prisma";

export async function uploadCandidateResume({
  branchId,
  candidateId,
  userId,
  resumeUrl,
}: {
  branchId: string;
  candidateId: string;
  userId: string;
  resumeUrl: string;
}) {
  const existing = await prisma.candidate.findFirst({
    where: { id: candidateId, branchId, deletedAt: null },
    include: { jobOpening: { select: { title: true } } },
  });

  if (!existing) {
    return { success: false as const, error: "Candidate not found" };
  }

  const candidate = await prisma.candidate.update({
    where: { id: candidateId },
    data: { resumeUrl, updatedBy: userId },
    include: { jobOpening: { select: { title: true } } },
  });

  return {
    success: true as const,
    candidate: mapCandidateToDetail(candidate),
  };
}
