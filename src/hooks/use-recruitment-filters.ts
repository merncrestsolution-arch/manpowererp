"use client";

import type { CandidateSource, CandidateStatus } from "@prisma/client";

export type CandidateFiltersState = {
  search: string;
  status: CandidateStatus | "";
  source: CandidateSource | "";
  jobOpeningId: string;
  includeDeleted: boolean;
};

export const defaultCandidateFilters: CandidateFiltersState = {
  search: "",
  status: "",
  source: "",
  jobOpeningId: "",
  includeDeleted: false,
};
