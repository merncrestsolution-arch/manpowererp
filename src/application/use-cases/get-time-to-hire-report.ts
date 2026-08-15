import { differenceInCalendarDays } from "date-fns";

import { prisma } from "@/infrastructure/db/prisma";

import type { TimeToHireReport } from "@/types/reports";

export async function getTimeToHireReport(
  branchId: string,
): Promise<TimeToHireReport> {
  const placedCandidates = await prisma.candidate.findMany({
    where: {
      branchId,
      deletedAt: null,
      status: "PLACED",
    },
    select: {
      id: true,
      candidateNo: true,
      firstName: true,
      lastName: true,
      source: true,
      createdAt: true,
      statusHistory: {
        where: { toStatus: "PLACED" },
        orderBy: { changedAt: "asc" },
        take: 1,
        select: { changedAt: true },
      },
    },
  });

  const placements = placedCandidates
    .map((candidate) => {
      const placedAt =
        candidate.statusHistory[0]?.changedAt ?? candidate.createdAt;
      const daysToHire = Math.max(
        differenceInCalendarDays(placedAt, candidate.createdAt),
        0,
      );

      return {
        candidateId: candidate.id,
        candidateNo: candidate.candidateNo,
        name: `${candidate.firstName} ${candidate.lastName}`,
        daysToHire,
        source: candidate.source,
        placedAt: placedAt.toISOString(),
      };
    })
    .sort((a, b) => a.daysToHire - b.daysToHire);

  const dayValues = placements.map((placement) => placement.daysToHire);
  const averageDays =
    dayValues.length > 0
      ? Number(
          (
            dayValues.reduce((sum, value) => sum + value, 0) / dayValues.length
          ).toFixed(1),
        )
      : 0;

  const medianDays =
    dayValues.length > 0
      ? (dayValues[Math.floor(dayValues.length / 2)] ?? 0)
      : 0;

  return {
    averageDays,
    medianDays,
    placementCount: placements.length,
    placements,
  };
}
