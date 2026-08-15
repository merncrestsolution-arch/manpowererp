"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchApiData } from "@/lib/api-client";

import type { ClientFiltersState } from "@/hooks/use-client-filters";
import type {
  ClientBillingRecordItem,
  ClientContactItem,
  ClientContractItem,
  ClientDetail,
  ClientFilterOptions,
  ClientListItem,
  ClientWorkerAssignmentItem,
  PaginatedResult,
} from "@/types/client";

type ClientsListResponse = PaginatedResult<ClientListItem> & {
  filterOptions: ClientFilterOptions;
};

type UseClientsListParams = {
  page: number;
  pageSize: number;
  filters: ClientFiltersState;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

function buildClientsQuery(params: UseClientsListParams): string {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  if (params.filters.search) {
    searchParams.set("search", params.filters.search);
  }
  if (params.filters.industry) {
    searchParams.set("industry", params.filters.industry);
  }
  if (params.filters.city) {
    searchParams.set("city", params.filters.city);
  }
  if (params.filters.status) {
    searchParams.set("status", params.filters.status);
  }
  if (params.filters.includeDeleted) {
    searchParams.set("includeDeleted", "true");
  }

  return `/api/clients?${searchParams.toString()}`;
}

export function useClientsList(params: UseClientsListParams) {
  return useQuery({
    queryKey: ["clients", "list", params],
    queryFn: () => fetchApiData<ClientsListResponse>(buildClientsQuery(params)),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => fetchApiData<ClientDetail>(`/api/clients/${id}`),
    enabled: Boolean(id),
  });
}

export function useClientContacts(clientId: string) {
  return useQuery({
    queryKey: ["clients", clientId, "contacts"],
    queryFn: () =>
      fetchApiData<ClientContactItem[]>(`/api/clients/${clientId}/contacts`),
    enabled: Boolean(clientId),
  });
}

export function useClientContracts(clientId: string) {
  return useQuery({
    queryKey: ["clients", clientId, "contracts"],
    queryFn: () =>
      fetchApiData<ClientContractItem[]>(`/api/clients/${clientId}/contracts`),
    enabled: Boolean(clientId),
  });
}

export function useClientAssignments(clientId: string) {
  return useQuery({
    queryKey: ["clients", clientId, "assignments"],
    queryFn: () =>
      fetchApiData<ClientWorkerAssignmentItem[]>(
        `/api/clients/${clientId}/assignments`,
      ),
    enabled: Boolean(clientId),
  });
}

export function useClientBilling(clientId: string) {
  return useQuery({
    queryKey: ["clients", clientId, "billing"],
    queryFn: () =>
      fetchApiData<ClientBillingRecordItem[]>(
        `/api/clients/${clientId}/billing`,
      ),
    enabled: Boolean(clientId),
  });
}
