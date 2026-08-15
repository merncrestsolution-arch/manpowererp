"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchApiData } from "@/lib/api-client";

import type { DashboardSummary } from "@/types/dashboard";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => fetchApiData<DashboardSummary>("/api/dashboard/summary"),
  });
}
