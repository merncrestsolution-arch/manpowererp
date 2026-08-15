"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchApiData } from "@/lib/api-client";

import type { ExpenseBreakdownData } from "@/types/dashboard";

export function useExpenseBreakdown() {
  return useQuery({
    queryKey: ["dashboard", "expense-breakdown"],
    queryFn: () =>
      fetchApiData<ExpenseBreakdownData>("/api/dashboard/expense-breakdown"),
  });
}
