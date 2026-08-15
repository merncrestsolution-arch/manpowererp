import type {
  CandidateDetail,
  CandidateListItem,
  CandidateStatusHistoryItem,
  InterviewItem,
  JobOpeningDetail,
  JobOpeningListItem,
} from "@/types/recruitment";
import type {
  Candidate,
  CandidateStatus,
  CandidateStatusHistory,
  Interview,
  JobOpening,
  Prisma,
  User,
} from "@prisma/client";

export function parseOptionalDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function calculateDaysInStage(updatedAt: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - updatedAt.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

type CandidateWithJob = Candidate & {
  jobOpening: Pick<JobOpening, "title">;
};

export function mapCandidateToListItem(
  candidate: CandidateWithJob,
): CandidateListItem {
  return {
    id: candidate.id,
    candidateNo: candidate.candidateNo,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phone: candidate.phone,
    status: candidate.status,
    source: candidate.source,
    jobOpeningTitle: candidate.jobOpening.title,
    appliedFor: candidate.appliedFor,
    createdAt: candidate.createdAt.toISOString(),
    deletedAt: candidate.deletedAt?.toISOString() ?? null,
    daysInStage: calculateDaysInStage(candidate.updatedAt),
  };
}

export function mapCandidateToDetail(
  candidate: CandidateWithJob,
): CandidateDetail {
  return {
    id: candidate.id,
    candidateNo: candidate.candidateNo,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phone: candidate.phone,
    nic: candidate.nic,
    jobOpeningId: candidate.jobOpeningId,
    jobOpeningTitle: candidate.jobOpening.title,
    appliedFor: candidate.appliedFor,
    source: candidate.source,
    resumeUrl: candidate.resumeUrl,
    status: candidate.status,
    placedEmployeeId: candidate.placedEmployeeId,
    createdAt: candidate.createdAt.toISOString(),
    updatedAt: candidate.updatedAt.toISOString(),
    createdBy: candidate.createdBy,
    updatedBy: candidate.updatedBy,
    deletedAt: candidate.deletedAt?.toISOString() ?? null,
  };
}

export function mapInterview(
  interview: Interview & { interviewer: Pick<User, "name"> },
): InterviewItem {
  return {
    id: interview.id,
    scheduledAt: interview.scheduledAt.toISOString(),
    interviewerId: interview.interviewerId,
    interviewerName: interview.interviewer.name,
    mode: interview.mode,
    notes: interview.notes,
    outcome: interview.outcome,
  };
}

export function mapStatusHistory(
  entry: CandidateStatusHistory,
): CandidateStatusHistoryItem {
  return {
    id: entry.id,
    fromStatus: entry.fromStatus,
    toStatus: entry.toStatus,
    changedBy: entry.changedBy,
    changedAt: entry.changedAt.toISOString(),
    remarks: entry.remarks,
  };
}

type JobOpeningWithMeta = JobOpening & {
  client?: { companyName: string } | null;
  _count?: { candidates: number };
};

export function mapJobOpeningToListItem(
  opening: JobOpeningWithMeta,
): JobOpeningListItem {
  return {
    id: opening.id,
    title: opening.title,
    department: opening.department,
    clientName: opening.client?.companyName ?? null,
    positionsAvailable: opening.positionsAvailable,
    status: opening.status,
    candidateCount: opening._count?.candidates ?? 0,
    createdAt: opening.createdAt.toISOString(),
    deletedAt: opening.deletedAt?.toISOString() ?? null,
  };
}

export function mapJobOpeningToDetail(
  opening: JobOpeningWithMeta,
): JobOpeningDetail {
  return {
    id: opening.id,
    title: opening.title,
    department: opening.department,
    clientId: opening.clientId,
    clientName: opening.client?.companyName ?? null,
    positionsAvailable: opening.positionsAvailable,
    status: opening.status,
    createdAt: opening.createdAt.toISOString(),
    updatedAt: opening.updatedAt.toISOString(),
    createdBy: opening.createdBy,
    updatedBy: opening.updatedBy,
    deletedAt: opening.deletedAt?.toISOString() ?? null,
  };
}

export function buildCandidateSearchFilter(
  search?: string,
): Prisma.CandidateWhereInput | undefined {
  if (!search) {
    return undefined;
  }

  const term = search.trim();
  if (!term) {
    return undefined;
  }

  return {
    OR: [
      { firstName: { contains: term, mode: "insensitive" } },
      { lastName: { contains: term, mode: "insensitive" } },
      { candidateNo: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
      { nic: { contains: term, mode: "insensitive" } },
      { appliedFor: { contains: term, mode: "insensitive" } },
    ],
  };
}

export function buildJobOpeningSearchFilter(
  search?: string,
): Prisma.JobOpeningWhereInput | undefined {
  if (!search) {
    return undefined;
  }

  const term = search.trim();
  if (!term) {
    return undefined;
  }

  return {
    OR: [
      { title: { contains: term, mode: "insensitive" } },
      { department: { contains: term, mode: "insensitive" } },
    ],
  };
}

export const PIPELINE_STATUSES: CandidateStatus[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW_SCHEDULED",
  "INTERVIEWED",
  "OFFERED",
  "PLACED",
  "REJECTED",
  "WITHDRAWN",
];
