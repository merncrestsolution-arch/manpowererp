"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchApiData } from "@/lib/api-client";

import type {
  ExpenseApprovalHistoryItem,
  ExpenseCategoryItem,
  ExpenseDetail,
  ExpenseFilterOptions,
  ExpenseListItem,
  ExpenseReportSummary,
  PaginatedResult,
} from "@/types/expense";

type ExpensesListResponse = PaginatedResult<ExpenseListItem> & {
  filterOptions: ExpenseFilterOptions;
};

type ExpenseDetailResponse = {
  expense: ExpenseDetail;
  history: ExpenseApprovalHistoryItem[];
};

export type ExpenseFiltersState = {
  search: string;
  categoryId: string;
  status: string;
  paidById: string;
  dateFrom: string;
  dateTo: string;
  includeDeleted: boolean;
};

export const defaultExpenseFilters: ExpenseFiltersState = {
  search: "",
  categoryId: "",
  status: "",
  paidById: "",
  dateFrom: "",
  dateTo: "",
  includeDeleted: false,
};

function buildExpensesQuery(params: {
  page: number;
  pageSize: number;
  filters: ExpenseFiltersState;
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
  if (params.filters.categoryId) {
    searchParams.set("categoryId", params.filters.categoryId);
  }
  if (params.filters.status) searchParams.set("status", params.filters.status);
  if (params.filters.paidById) {
    searchParams.set("paidById", params.filters.paidById);
  }
  if (params.filters.dateFrom) {
    searchParams.set("dateFrom", params.filters.dateFrom);
  }
  if (params.filters.dateTo) searchParams.set("dateTo", params.filters.dateTo);
  if (params.filters.includeDeleted) {
    searchParams.set("includeDeleted", "true");
  }

  return `/api/expenses?${searchParams.toString()}`;
}

function buildReportQuery(filters: {
  dateFrom: string;
  dateTo: string;
  categoryId: string;
}): string {
  const searchParams = new URLSearchParams();
  if (filters.dateFrom) searchParams.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) searchParams.set("dateTo", filters.dateTo);
  if (filters.categoryId) searchParams.set("categoryId", filters.categoryId);
  return `/api/expenses/reports/summary?${searchParams.toString()}`;
}

export function useExpensesList(params: {
  page: number;
  pageSize: number;
  filters: ExpenseFiltersState;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["expenses", "list", params],
    queryFn: () =>
      fetchApiData<ExpensesListResponse>(buildExpensesQuery(params)),
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: ["expenses", id],
    queryFn: () => fetchApiData<ExpenseDetailResponse>(`/api/expenses/${id}`),
    enabled: Boolean(id),
  });
}

export function useExpenseCategories() {
  return useQuery({
    queryKey: ["expenses", "categories"],
    queryFn: () =>
      fetchApiData<ExpenseCategoryItem[]>("/api/expenses/categories"),
  });
}

export function useExpenseReport(filters: {
  dateFrom: string;
  dateTo: string;
  categoryId: string;
}) {
  return useQuery({
    queryKey: ["expenses", "report", filters],
    queryFn: () =>
      fetchApiData<ExpenseReportSummary>(buildReportQuery(filters)),
  });
}

export function usePendingExpenses() {
  return useExpensesList({
    page: 1,
    pageSize: 50,
    filters: { ...defaultExpenseFilters, status: "PENDING" },
    sortBy: "expenseDate",
    sortOrder: "desc",
  });
}
