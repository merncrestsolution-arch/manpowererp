import { mapInterview } from "@/application/mappers/recruitment-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { ScheduleInterviewInput } from "@/application/dto/interview.schema";
import type { InterviewItem } from "@/types/recruitment";

export async function scheduleInterview({
  branchId,
  candidateId,
  userId,
  input,
}: {
  branchId: string;
  candidateId: string;
  userId: string;
  input: ScheduleInterviewInput;
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

  if (candidate.status === "PLACED") {
    return {
      success: false,
      error: "Cannot schedule interview for placed candidate",
    };
  }

  const interviewer = await prisma.user.findFirst({
    where: { id: input.interviewerId, deletedAt: null, isActive: true },
    select: { id: true, name: true },
  });

  if (!interviewer) {
    return { success: false, error: "Interviewer not found" };
  }

  const scheduledAt = new Date(input.scheduledAt);

  if (Number.isNaN(scheduledAt.getTime())) {
    return { success: false, error: "Invalid schedule date" };
  }

  const interview = await prisma.$transaction(async (tx) => {
    const created = await tx.interview.create({
      data: {
        candidateId,
        scheduledAt,
        interviewerId: input.interviewerId,
        mode: input.mode,
        notes: input.notes || null,
        createdBy: userId,
        updatedBy: userId,
      },
      include: { interviewer: { select: { name: true } } },
    });

    if (
      candidate.status !== "INTERVIEW_SCHEDULED" &&
      candidate.status !== "INTERVIEWED" &&
      candidate.status !== "OFFERED"
    ) {
      await tx.candidate.update({
        where: { id: candidateId },
        data: { status: "INTERVIEW_SCHEDULED", updatedBy: userId },
      });

      await tx.candidateStatusHistory.create({
        data: {
          candidateId,
          fromStatus: candidate.status,
          toStatus: "INTERVIEW_SCHEDULED",
          changedBy: userId,
          remarks: "Interview scheduled",
        },
      });
    }

    return created;
  });

  return { success: true, interview: mapInterview(interview) };
}

export async function listCandidateInterviews(
  branchId: string,
  candidateId: string,
): Promise<InterviewItem[]> {
  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, branchId },
    select: { id: true },
  });

  if (!candidate) {
    return [];
  }

  const interviews = await prisma.interview.findMany({
    where: { candidateId, deletedAt: null },
    include: { interviewer: { select: { name: true } } },
    orderBy: { scheduledAt: "desc" },
  });

  return interviews.map(mapInterview);
}
