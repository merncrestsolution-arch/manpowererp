import { prisma } from "@/infrastructure/db/prisma";

import type { RecruitmentFunnelReport } from "@/types/reports";

const FUNNEL_STAGES = [
  { stage: "APPLIED", label: "Applied" },
  { stage: "SCREENING", label: "Screening" },
  { stage: "INTERVIEW_SCHEDULED", label: "Interview scheduled" },
  { stage: "INTERVIEWED", label: "Interviewed" },
  { stage: "OFFERED", label: "Offered" },
  { stage: "PLACED", label: "Placed" },
] as const;

const SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  AGENCY: "Agency",
  WALK_IN: "Walk-in",
  OTHER: "Other",
};

export async function getRecruitmentFunnelReport(
  branchId: string,
): Promise<RecruitmentFunnelReport> {
  const [history, candidates] = await Promise.all([
    prisma.candidateStatusHistory.findMany({
      where: {
        candidate: { branchId, deletedAt: null },
      },
      select: { candidateId: true, toStatus: true },
    }),
    prisma.candidate.findMany({
      where: { branchId, deletedAt: null },
      select: { id: true, source: true, status: true },
    }),
  ]);

  const reachedStage = new Map<string, Set<string>>();
  for (const stage of FUNNEL_STAGES) {
    reachedStage.set(stage.stage, new Set());
  }

  for (const entry of history) {
    const bucket = reachedStage.get(entry.toStatus);
    if (bucket) {
      bucket.add(entry.candidateId);
    }
  }

  for (const candidate of candidates) {
    const bucket = reachedStage.get(candidate.status);
    if (bucket) {
      bucket.add(candidate.id);
    }
  }

  const stages = FUNNEL_STAGES.map((stage) => ({
    stage: stage.stage,
    label: stage.label,
    count: reachedStage.get(stage.stage)?.size ?? 0,
  }));

  const sourceMap = new Map<string, { total: number; placed: number }>();
  for (const candidate of candidates) {
    const entry = sourceMap.get(candidate.source) ?? { total: 0, placed: 0 };
    entry.total += 1;
    if (candidate.status === "PLACED") {
      entry.placed += 1;
    }
    sourceMap.set(candidate.source, entry);
  }

  const sourceOfHire = Array.from(sourceMap.entries())
    .map(([source, value]) => ({
      source,
      label: SOURCE_LABELS[source] ?? source,
      total: value.total,
      placed: value.placed,
    }))
    .sort((a, b) => b.placed - a.placed);

  return { stages, sourceOfHire };
}
