"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchApiData } from "@/lib/api-client";

import type { RevenueTrendData } from "@/types/dashboard";

export function useRevenueTrend() {
  return useQuery({
    queryKey: ["dashboard", "revenue-trend"],
    queryFn: () =>
      fetchApiData<RevenueTrendData>("/api/dashboard/revenue-trend"),
  });
}
