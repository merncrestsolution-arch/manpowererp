import type {
  CandidateSource,
  CandidateStatus,
  InterviewMode,
  InterviewOutcome,
  JobOpeningStatus,
} from "@prisma/client";

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CandidateListItem = {
  id: string;
  candidateNo: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: CandidateStatus;
  source: CandidateSource;
  jobOpeningTitle: string;
  appliedFor: string | null;
  createdAt: string;
  deletedAt: string | null;
  daysInStage: number;
};

export type CandidateDetail = {
  id: string;
  candidateNo: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  nic: string | null;
  jobOpeningId: string;
  jobOpeningTitle: string;
  appliedFor: string | null;
  source: CandidateSource;
  resumeUrl: string | null;
  status: CandidateStatus;
  placedEmployeeId: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
};

export type CandidatePipelineColumn = {
  status: CandidateStatus;
  count: number;
  candidates: CandidateListItem[];
};

export type InterviewItem = {
  id: string;
  scheduledAt: string;
  interviewerId: string;
  interviewerName: string;
  mode: InterviewMode;
  notes: string | null;
  outcome: InterviewOutcome;
};

export type CandidateStatusHistoryItem = {
  id: string;
  fromStatus: CandidateStatus | null;
  toStatus: CandidateStatus;
  changedBy: string;
  changedAt: string;
  remarks: string | null;
};

export type JobOpeningListItem = {
  id: string;
  title: string;
  department: string | null;
  clientName: string | null;
  positionsAvailable: number;
  status: JobOpeningStatus;
  candidateCount: number;
  createdAt: string;
  deletedAt: string | null;
};

export type JobOpeningDetail = {
  id: string;
  title: string;
  department: string | null;
  clientId: string | null;
  clientName: string | null;
  positionsAvailable: number;
  status: JobOpeningStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
};

export type JobOpeningOption = {
  id: string;
  title: string;
  department: string | null;
};

export type InterviewerOption = {
  id: string;
  name: string;
  email: string;
};
