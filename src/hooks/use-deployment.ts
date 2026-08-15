"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchApiData } from "@/lib/api-client";

import type {
  AvailabilityBoard,
  DeploymentContractItem,
  DeploymentDetail,
  DeploymentFilterOptions,
  DeploymentListItem,
  PaginatedResult,
  ShiftCoverageRow,
  WorkLocationDetail,
  WorkLocationListItem,
} from "@/types/deployment";

type DeploymentsListResponse = PaginatedResult<DeploymentListItem> & {
  filterOptions: DeploymentFilterOptions;
};

type DeploymentFiltersState = {
  search: string;
  clientId: string;
  status: string;
  includeDeleted: boolean;
};

type WorkLocationFiltersState = {
  search: string;
  clientId: string;
  status: string;
  includeDeleted: boolean;
};

function buildDeploymentsQuery(params: {
  page: number;
  pageSize: number;
  filters: DeploymentFiltersState;
  sortBy: string;
  sortOrder: "asc" | "desc";
}): string {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  if (params.filters.search) {
    searchParams.set("search", params.filters.search);
  }
  if (params.filters.clientId) {
    searchParams.set("clientId", params.filters.clientId);
  }
  if (params.filters.status) {
    searchParams.set("status", params.filters.status);
  }
  if (params.filters.includeDeleted) {
    searchParams.set("includeDeleted", "true");
  }

  return `/api/deployment?${searchParams.toString()}`;
}

function buildWorkLocationsQuery(params: {
  page: number;
  pageSize: number;
  filters: WorkLocationFiltersState;
  sortBy: string;
  sortOrder: "asc" | "desc";
}): string {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  if (params.filters.search) {
    searchParams.set("search", params.filters.search);
  }
  if (params.filters.clientId) {
    searchParams.set("clientId", params.filters.clientId);
  }
  if (params.filters.status) {
    searchParams.set("status", params.filters.status);
  }
  if (params.filters.includeDeleted) {
    searchParams.set("includeDeleted", "true");
  }

  return `/api/deployment/work-locations?${searchParams.toString()}`;
}

export function useDeploymentsList(params: {
  page: number;
  pageSize: number;
  filters: DeploymentFiltersState;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["deployment", "list", params],
    queryFn: () =>
      fetchApiData<DeploymentsListResponse>(buildDeploymentsQuery(params)),
  });
}

export function useDeployment(id: string) {
  return useQuery({
    queryKey: ["deployment", id],
    queryFn: () => fetchApiData<DeploymentDetail>(`/api/deployment/${id}`),
    enabled: Boolean(id),
  });
}

export function useDeploymentContracts(deploymentId: string) {
  return useQuery({
    queryKey: ["deployment", deploymentId, "contracts"],
    queryFn: () =>
      fetchApiData<DeploymentContractItem[]>(
        `/api/deployment/${deploymentId}/contract`,
      ),
    enabled: Boolean(deploymentId),
  });
}

export function useWorkLocationsList(params: {
  page: number;
  pageSize: number;
  filters: WorkLocationFiltersState;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["deployment", "work-locations", params],
    queryFn: () =>
      fetchApiData<PaginatedResult<WorkLocationListItem>>(
        buildWorkLocationsQuery(params),
      ),
  });
}

export function useWorkLocation(id: string) {
  return useQuery({
    queryKey: ["deployment", "work-locations", id],
    queryFn: () =>
      fetchApiData<WorkLocationDetail>(`/api/deployment/work-locations/${id}`),
    enabled: Boolean(id),
  });
}

export function useWorkLocationOptions(clientId: string) {
  return useQuery({
    queryKey: ["deployment", "work-locations", "options", clientId],
    queryFn: () =>
      fetchApiData<Array<{ id: string; name: string; city: string | null }>>(
        `/api/deployment/work-locations?clientId=${clientId}&mode=options`,
      ),
    enabled: Boolean(clientId),
  });
}

export function useBranchShifts() {
  return useQuery({
    queryKey: ["deployment", "shifts"],
    queryFn: () =>
      fetchApiData<
        Array<{ id: string; name: string; startTime: string; endTime: string }>
      >("/api/deployment/shifts"),
  });
}

export function useShiftCoverage(workLocationId: string) {
  return useQuery({
    queryKey: ["deployment", "shift-coverage", workLocationId],
    queryFn: () =>
      fetchApiData<{
        workLocationId: string;
        workLocationName: string;
        coverage: ShiftCoverageRow[];
      }>(
        `/api/deployment/work-locations/${workLocationId}?view=shift-coverage`,
      ),
    enabled: Boolean(workLocationId),
  });
}

export function useAvailabilityBoard(params: {
  department?: string;
  designation?: string;
  search?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params.department) {
    searchParams.set("department", params.department);
  }
  if (params.designation) {
    searchParams.set("designation", params.designation);
  }
  if (params.search) {
    searchParams.set("search", params.search);
  }

  const query = searchParams.toString();

  return useQuery({
    queryKey: ["deployment", "availability", params],
    queryFn: () =>
      fetchApiData<AvailabilityBoard>(
        `/api/deployment/availability${query ? `?${query}` : ""}`,
      ),
  });
}

export const defaultDeploymentFilters: DeploymentFiltersState = {
  search: "",
  clientId: "",
  status: "",
  includeDeleted: false,
};

export const defaultWorkLocationFilters: WorkLocationFiltersState = {
  search: "",
  clientId: "",
  status: "",
  includeDeleted: false,
};
