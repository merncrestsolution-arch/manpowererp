import { mapInterview } from "@/application/mappers/recruitment-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { RecordInterviewOutcomeInput } from "@/application/dto/interview.schema";
import type { InterviewItem } from "@/types/recruitment";

export async function recordInterviewOutcome({
  branchId,
  candidateId,
  userId,
  input,
}: {
  branchId: string;
  candidateId: string;
  userId: string;
  input: RecordInterviewOutcomeInput;
}): Promise<
  | { success: true; interview: InterviewItem }
  | { success: false; error: string }
> {
  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, branchId, deletedAt: null },
  });

  if (!candidate) {
    return { success: false, error: "Candidate not found" };
  }

  const existing = await prisma.interview.findFirst({
    where: {
      id: input.interviewId,
      candidateId,
      deletedAt: null,
    },
  });

  if (!existing) {
    return { success: false, error: "Interview not found" };
  }

  const interview = await prisma.$transaction(async (tx) => {
    const updated = await tx.interview.update({
      where: { id: input.interviewId },
      data: {
        outcome: input.outcome,
        notes: input.notes ?? existing.notes,
        updatedBy: userId,
      },
      include: { interviewer: { select: { name: true } } },
    });

    if (
      input.outcome === "PASSED" &&
      candidate.status !== "OFFERED" &&
      candidate.status !== "PLACED"
    ) {
      await tx.candidate.update({
        where: { id: candidateId },
        data: { status: "INTERVIEWED", updatedBy: userId },
      });

      await tx.candidateStatusHistory.create({
        data: {
          candidateId,
          fromStatus: candidate.status,
          toStatus: "INTERVIEWED",
          changedBy: userId,
          remarks: "Interview passed",
        },
      });
    }

    return updated;
  });

  return { success: true, interview: mapInterview(interview) };
}
