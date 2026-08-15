"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchApiData } from "@/lib/api-client";

import type { EmployeeFiltersState } from "@/hooks/use-debounce";
import type {
  EmployeeDetail,
  EmployeeDocumentItem,
  EmployeeFilterOptions,
  EmployeeListItem,
  EmployeeShiftItem,
  LeaveRequestItem,
  PaginatedResult,
} from "@/types/employee";

type EmployeesListResponse = PaginatedResult<EmployeeListItem> & {
  filterOptions: EmployeeFilterOptions;
};

type UseEmployeesListParams = {
  page: number;
  pageSize: number;
  filters: EmployeeFiltersState;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

function buildEmployeesQuery(params: UseEmployeesListParams): string {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  if (params.filters.search) {
    searchParams.set("search", params.filters.search);
  }
  if (params.filters.department) {
    searchParams.set("department", params.filters.department);
  }
  if (params.filters.designation) {
    searchParams.set("designation", params.filters.designation);
  }
  if (params.filters.employmentType) {
    searchParams.set("employmentType", params.filters.employmentType);
  }
  if (params.filters.status) {
    searchParams.set("status", params.filters.status);
  }
  if (params.filters.includeDeleted) {
    searchParams.set("includeDeleted", "true");
  }

  return `/api/employees?${searchParams.toString()}`;
}

export function useEmployeesList(params: UseEmployeesListParams) {
  return useQuery({
    queryKey: ["employees", "list", params],
    queryFn: () =>
      fetchApiData<EmployeesListResponse>(buildEmployeesQuery(params)),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: () => fetchApiData<EmployeeDetail>(`/api/employees/${id}`),
    enabled: Boolean(id),
  });
}

export function useEmployeeDocuments(employeeId: string) {
  return useQuery({
    queryKey: ["employees", employeeId, "documents"],
    queryFn: () =>
      fetchApiData<EmployeeDocumentItem[]>(
        `/api/employees/${employeeId}/documents`,
      ),
    enabled: Boolean(employeeId),
  });
}

export function useEmployeeLeave(employeeId: string) {
  return useQuery({
    queryKey: ["employees", employeeId, "leave"],
    queryFn: () =>
      fetchApiData<LeaveRequestItem[]>(`/api/employees/${employeeId}/leave`),
    enabled: Boolean(employeeId),
  });
}

type ShiftsResponse = {
  assignments: EmployeeShiftItem[];
  availableShifts: Array<{
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  }>;
};

export function useEmployeeShifts(employeeId: string) {
  return useQuery({
    queryKey: ["employees", employeeId, "shifts"],
    queryFn: () =>
      fetchApiData<ShiftsResponse>(`/api/employees/${employeeId}/shifts`),
    enabled: Boolean(employeeId),
  });
}

export function useEmployeeAttendance(employeeId: string) {
  return useQuery({
    queryKey: ["employees", employeeId, "attendance"],
    queryFn: () =>
      fetchApiData<{
        status:
          | "PRESENT"
          | "ABSENT"
          | "LATE"
          | "HALF_DAY"
          | "ON_LEAVE"
          | "NOT_RECORDED";
        checkInTime: string | null;
        checkOutTime: string | null;
        workingHoursPercent: number;
      }>(`/api/employees/${employeeId}/attendance`),
    enabled: Boolean(employeeId),
  });
}
