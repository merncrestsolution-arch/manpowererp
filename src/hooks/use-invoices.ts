"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchApiData } from "@/lib/api-client";

import type {
  InvoiceDetail,
  InvoiceFilterOptions,
  InvoiceListItem,
  OutstandingReport,
  PaginatedResult,
  QuotationDetail,
  QuotationFilterOptions,
  QuotationListItem,
} from "@/types/invoice";

type InvoicesListResponse = PaginatedResult<InvoiceListItem> & {
  filterOptions: InvoiceFilterOptions;
};

type QuotationsListResponse = PaginatedResult<QuotationListItem> & {
  filterOptions: QuotationFilterOptions;
};

export type InvoiceFiltersState = {
  search: string;
  clientId: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  includeDeleted: boolean;
};

export const defaultInvoiceFilters: InvoiceFiltersState = {
  search: "",
  clientId: "",
  status: "",
  dateFrom: "",
  dateTo: "",
  includeDeleted: false,
};

export type QuotationFiltersState = InvoiceFiltersState;

export const defaultQuotationFilters: QuotationFiltersState = {
  ...defaultInvoiceFilters,
};

function buildInvoicesQuery(params: {
  page: number;
  pageSize: number;
  filters: InvoiceFiltersState;
  sortBy: string;
  sortOrder: "asc" | "desc";
}): string {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  if (params.filters.search) searchParams.set("search", params.filters.search);
  if (params.filters.clientId)
    searchParams.set("clientId", params.filters.clientId);
  if (params.filters.status) searchParams.set("status", params.filters.status);
  if (params.filters.dateFrom)
    searchParams.set("dateFrom", params.filters.dateFrom);
  if (params.filters.dateTo) searchParams.set("dateTo", params.filters.dateTo);
  if (params.filters.includeDeleted) {
    searchParams.set("includeDeleted", "true");
  }

  return `/api/invoices?${searchParams.toString()}`;
}

function buildQuotationsQuery(params: {
  page: number;
  pageSize: number;
  filters: QuotationFiltersState;
  sortBy: string;
  sortOrder: "asc" | "desc";
}): string {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  if (params.filters.search) searchParams.set("search", params.filters.search);
  if (params.filters.clientId)
    searchParams.set("clientId", params.filters.clientId);
  if (params.filters.status) searchParams.set("status", params.filters.status);
  if (params.filters.dateFrom)
    searchParams.set("dateFrom", params.filters.dateFrom);
  if (params.filters.dateTo) searchParams.set("dateTo", params.filters.dateTo);
  if (params.filters.includeDeleted) {
    searchParams.set("includeDeleted", "true");
  }

  return `/api/invoices/quotations?${searchParams.toString()}`;
}

export function useInvoicesList(params: {
  page: number;
  pageSize: number;
  filters: InvoiceFiltersState;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["invoices", "list", params],
    queryFn: () =>
      fetchApiData<InvoicesListResponse>(buildInvoicesQuery(params)),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: () => fetchApiData<InvoiceDetail>(`/api/invoices/${id}`),
    enabled: Boolean(id),
  });
}

export function useQuotationsList(params: {
  page: number;
  pageSize: number;
  filters: QuotationFiltersState;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["quotations", "list", params],
    queryFn: () =>
      fetchApiData<QuotationsListResponse>(buildQuotationsQuery(params)),
  });
}

export function useQuotation(id: string) {
  return useQuery({
    queryKey: ["quotations", id],
    queryFn: () =>
      fetchApiData<QuotationDetail>(`/api/invoices/quotations/${id}`),
    enabled: Boolean(id),
  });
}

export function useOutstandingReport() {
  return useQuery({
    queryKey: ["invoices", "outstanding"],
    queryFn: () => fetchApiData<OutstandingReport>("/api/invoices/outstanding"),
  });
}
