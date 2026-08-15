import { mapStatusHistory } from "@/application/mappers/recruitment-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { CandidateStatusHistoryItem } from "@/types/recruitment";

export async function listCandidateStatusHistory(
  branchId: string,
  candidateId: string,
): Promise<CandidateStatusHistoryItem[]> {
  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, branchId },
    select: { id: true },
  });

  if (!candidate) {
    return [];
  }

  const history = await prisma.candidateStatusHistory.findMany({
    where: { candidateId },
    orderBy: { changedAt: "desc" },
  });

  return history.map(mapStatusHistory);
}
