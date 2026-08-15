"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchApiData, postApiData } from "@/lib/api-client";

import type {
  AttendanceListItem,
  CheckInResult,
  CheckOutResult,
  EmployeeTimesheet,
  OvertimeListItem,
  PaginatedAttendanceResult,
  QrCheckpointItem,
} from "@/types/attendance";

type AttendanceFiltersState = {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  employeeId: string;
};

export const defaultAttendanceFilters: AttendanceFiltersState = {
  search: "",
  status: "",
  dateFrom: "",
  dateTo: "",
  employeeId: "",
};

function buildAttendanceQuery(params: {
  page: number;
  pageSize: number;
  filters: AttendanceFiltersState;
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
  if (params.filters.status) {
    searchParams.set("status", params.filters.status);
  }
  if (params.filters.dateFrom) {
    searchParams.set("dateFrom", params.filters.dateFrom);
  }
  if (params.filters.dateTo) {
    searchParams.set("dateTo", params.filters.dateTo);
  }
  if (params.filters.employeeId) {
    searchParams.set("employeeId", params.filters.employeeId);
  }

  return `/api/attendance?${searchParams.toString()}`;
}

export function useAttendanceList(params: {
  page: number;
  pageSize: number;
  filters: AttendanceFiltersState;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["attendance", params],
    queryFn: () =>
      fetchApiData<PaginatedAttendanceResult<AttendanceListItem>>(
        buildAttendanceQuery(params),
      ),
  });
}

export function useQrCheckpoints() {
  return useQuery({
    queryKey: ["attendance", "qr-checkpoints"],
    queryFn: () =>
      fetchApiData<QrCheckpointItem[]>("/api/attendance/qr-checkpoints"),
  });
}

export function useEmployeeTimesheet(
  employeeId: string,
  period: "week" | "month" = "week",
  date?: string,
) {
  const searchParams = new URLSearchParams({
    employeeId,
    period,
  });

  if (date) {
    searchParams.set("date", date);
  }

  return useQuery({
    queryKey: ["attendance", "timesheets", employeeId, period, date],
    queryFn: () =>
      fetchApiData<EmployeeTimesheet>(
        `/api/attendance/timesheets?${searchParams.toString()}`,
      ),
    enabled: Boolean(employeeId),
  });
}

type TimesheetSummaryList = {
  periodStart: string;
  periodEnd: string;
  items: Array<{
    employeeId: string;
    employeeNo: string;
    employeeName: string;
    periodStart: string;
    periodEnd: string;
    totalWorkedHours: number;
    totalOvertimeHours: number;
    presentDays: number;
  }>;
};

export function useTimesheetSummaries(
  period: "week" | "month" = "week",
  date?: string,
) {
  const searchParams = new URLSearchParams({ period });

  if (date) {
    searchParams.set("date", date);
  }

  return useQuery({
    queryKey: ["attendance", "timesheets", "summaries", period, date],
    queryFn: () =>
      fetchApiData<TimesheetSummaryList>(
        `/api/attendance/timesheets?${searchParams.toString()}`,
      ),
  });
}

export function useOvertimeList(params: {
  page: number;
  pageSize: number;
  status?: string;
}) {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });

  if (params.status) {
    searchParams.set("status", params.status);
  }

  return useQuery({
    queryKey: ["attendance", "overtime", params],
    queryFn: () =>
      fetchApiData<{
        items: OvertimeListItem[];
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      }>(`/api/attendance/overtime?${searchParams.toString()}`),
  });
}

export async function submitCheckIn(body: {
  method: "QR" | "GPS";
  qrCode?: string;
  latitude?: number;
  longitude?: number;
}) {
  return postApiData<CheckInResult>("/api/attendance/check-in", body);
}

export async function submitCheckOut(body: {
  method: "QR" | "GPS";
  qrCode?: string;
  latitude?: number;
  longitude?: number;
}) {
  return postApiData<CheckOutResult>("/api/attendance/check-out", body);
}

export async function submitManualAttendance(body: Record<string, unknown>) {
  return postApiData("/api/attendance/manual", body);
}

export async function generateQrCheckpoint(body: {
  workLocationId: string;
  expiresInHours?: number;
}) {
  return postApiData<QrCheckpointItem>("/api/attendance/qr-checkpoints", body);
}

export async function approveOvertimeRecord(
  id: string,
  status: "APPROVED" | "REJECTED",
) {
  return postApiData<OvertimeListItem>(
    `/api/attendance/overtime/${id}/approve`,
    { status },
  );
}
