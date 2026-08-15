"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchApiData } from "@/lib/api-client";

import type { CandidateFiltersState } from "@/hooks/use-recruitment-filters";
import type {
  CandidateDetail,
  CandidateListItem,
  CandidatePipelineColumn,
  CandidateStatusHistoryItem,
  InterviewItem,
  JobOpeningDetail,
  JobOpeningListItem,
  JobOpeningOption,
  InterviewerOption,
  PaginatedResult,
} from "@/types/recruitment";

type UseCandidatesListParams = {
  page: number;
  pageSize: number;
  filters: CandidateFiltersState;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

function buildCandidatesQuery(params: UseCandidatesListParams): string {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  if (params.filters.search) searchParams.set("search", params.filters.search);
  if (params.filters.status) searchParams.set("status", params.filters.status);
  if (params.filters.source) searchParams.set("source", params.filters.source);
  if (params.filters.jobOpeningId) {
    searchParams.set("jobOpeningId", params.filters.jobOpeningId);
  }
  if (params.filters.includeDeleted) {
    searchParams.set("includeDeleted", "true");
  }

  return `/api/recruitment/candidates?${searchParams.toString()}`;
}

export function useCandidatesList(params: UseCandidatesListParams) {
  return useQuery({
    queryKey: ["recruitment", "candidates", "list", params],
    queryFn: () =>
      fetchApiData<PaginatedResult<CandidateListItem>>(
        buildCandidatesQuery(params),
      ),
  });
}

export function useCandidatePipeline() {
  return useQuery({
    queryKey: ["recruitment", "candidates", "pipeline"],
    queryFn: () =>
      fetchApiData<CandidatePipelineColumn[]>(
        "/api/recruitment/candidates?view=pipeline",
      ),
  });
}

export function useCandidate(id: string) {
  return useQuery({
    queryKey: ["recruitment", "candidates", id],
    queryFn: () =>
      fetchApiData<CandidateDetail>(`/api/recruitment/candidates/${id}`),
    enabled: Boolean(id),
  });
}

export function useCandidateInterviews(candidateId: string) {
  return useQuery({
    queryKey: ["recruitment", "candidates", candidateId, "interviews"],
    queryFn: () =>
      fetchApiData<InterviewItem[]>(
        `/api/recruitment/candidates/${candidateId}/interviews`,
      ),
    enabled: Boolean(candidateId),
  });
}

export function useCandidateStatusHistory(candidateId: string) {
  return useQuery({
    queryKey: ["recruitment", "candidates", candidateId, "status-history"],
    queryFn: () =>
      fetchApiData<CandidateStatusHistoryItem[]>(
        `/api/recruitment/candidates/${candidateId}/status-history`,
      ),
    enabled: Boolean(candidateId),
  });
}

export function useJobOpeningsList(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["recruitment", "job-openings", page, pageSize],
    queryFn: () =>
      fetchApiData<PaginatedResult<JobOpeningListItem>>(
        `/api/recruitment/job-openings?page=${page}&pageSize=${pageSize}`,
      ),
  });
}

export function useJobOpening(id: string) {
  return useQuery({
    queryKey: ["recruitment", "job-openings", id],
    queryFn: () =>
      fetchApiData<JobOpeningDetail>(`/api/recruitment/job-openings/${id}`),
    enabled: Boolean(id),
  });
}

export function useJobOpeningOptions() {
  return useQuery({
    queryKey: ["recruitment", "job-openings", "options"],
    queryFn: () =>
      fetchApiData<JobOpeningOption[]>(
        "/api/recruitment/job-openings?options=true",
      ),
  });
}

export function useInterviewers() {
  return useQuery({
    queryKey: ["recruitment", "interviewers"],
    queryFn: () =>
      fetchApiData<InterviewerOption[]>(
        "/api/recruitment/job-openings?interviewers=true",
      ),
  });
}
