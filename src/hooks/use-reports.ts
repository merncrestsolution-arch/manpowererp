"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchApiData } from "@/lib/api-client";

import type {
  AttendanceSummaryReport,
  DeploymentUtilizationReport,
  HeadcountReport,
  LeaveUtilizationReport,
  RecruitmentFunnelReport,
  TimeToHireReport,
} from "@/types/reports";

export function useHeadcountReport() {
  return useQuery({
    queryKey: ["reports", "hr", "headcount"],
    queryFn: () => fetchApiData<HeadcountReport>("/api/reports/hr/headcount"),
  });
}

export function useLeaveUtilizationReport(filters: {
  dateFrom?: string;
  dateTo?: string;
}) {
  const searchParams = new URLSearchParams();
  if (filters.dateFrom) {
    searchParams.set("dateFrom", filters.dateFrom);
  }
  if (filters.dateTo) {
    searchParams.set("dateTo", filters.dateTo);
  }

  return useQuery({
    queryKey: ["reports", "hr", "leave", filters],
    queryFn: () =>
      fetchApiData<LeaveUtilizationReport>(
        `/api/reports/hr/leave?${searchParams.toString()}`,
      ),
  });
}

export function useAttendanceSummaryReport(filters: {
  dateFrom: string;
  dateTo: string;
}) {
  const searchParams = new URLSearchParams({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  });

  return useQuery({
    queryKey: ["reports", "hr", "attendance", filters],
    queryFn: () =>
      fetchApiData<AttendanceSummaryReport>(
        `/api/reports/hr/attendance?${searchParams.toString()}`,
      ),
    enabled: Boolean(filters.dateFrom && filters.dateTo),
  });
}

export function useRecruitmentFunnelReport() {
  return useQuery({
    queryKey: ["reports", "recruitment", "funnel"],
    queryFn: () =>
      fetchApiData<RecruitmentFunnelReport>("/api/reports/recruitment/funnel"),
  });
}

export function useTimeToHireReport() {
  return useQuery({
    queryKey: ["reports", "recruitment", "time-to-hire"],
    queryFn: () =>
      fetchApiData<TimeToHireReport>("/api/reports/recruitment/time-to-hire"),
  });
}

export function useDeploymentUtilizationReport(filters: {
  dateFrom?: string;
  dateTo?: string;
}) {
  const searchParams = new URLSearchParams();
  if (filters.dateFrom) {
    searchParams.set("dateFrom", filters.dateFrom);
  }
  if (filters.dateTo) {
    searchParams.set("dateTo", filters.dateTo);
  }

  return useQuery({
    queryKey: ["reports", "deployment", "utilization", filters],
    queryFn: () =>
      fetchApiData<DeploymentUtilizationReport>(
        `/api/reports/deployment/utilization?${searchParams.toString()}`,
      ),
  });
}
