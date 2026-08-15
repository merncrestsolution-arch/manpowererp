"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchApiData, postApiData } from "@/lib/api-client";

import type {
  PaginatedResult,
  PayrollPeriodDetail,
  PayrollPeriodListItem,
  PayrollSummaryReport,
  PayslipDetail,
  PayslipListItem,
  RunPayrollResult,
  SalaryComponentItem,
} from "@/types/payroll";

export function usePayrollPeriods(params: {
  page: number;
  pageSize: number;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    sortBy: params.sortBy ?? "periodStart",
    sortOrder: params.sortOrder ?? "desc",
  });

  if (params.status) {
    searchParams.set("status", params.status);
  }

  return useQuery({
    queryKey: ["payroll", "periods", params],
    queryFn: () =>
      fetchApiData<PaginatedResult<PayrollPeriodListItem>>(
        `/api/payroll/periods?${searchParams.toString()}`,
      ),
  });
}

export function usePayrollPeriod(periodId: string) {
  return useQuery({
    queryKey: ["payroll", "periods", periodId],
    queryFn: () =>
      fetchApiData<PayrollPeriodDetail>(`/api/payroll/periods/${periodId}`),
    enabled: Boolean(periodId),
  });
}

export function useSalaryComponents(includeInactive = true) {
  return useQuery({
    queryKey: ["payroll", "components", includeInactive],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (includeInactive) {
        searchParams.set("includeInactive", "true");
      }
      return fetchApiData<SalaryComponentItem[]>(
        `/api/payroll/components?${searchParams.toString()}`,
      );
    },
  });
}

export function usePayslips(params: {
  payrollPeriodId?: string;
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  const searchParams = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 50),
  });

  if (params.payrollPeriodId) {
    searchParams.set("payrollPeriodId", params.payrollPeriodId);
  }
  if (params.status) {
    searchParams.set("status", params.status);
  }

  return useQuery({
    queryKey: ["payroll", "payslips", params],
    queryFn: () =>
      fetchApiData<PaginatedResult<PayslipListItem>>(
        `/api/payroll/payslips?${searchParams.toString()}`,
      ),
    enabled: Boolean(params.payrollPeriodId),
  });
}

export function usePayslip(payslipId: string) {
  return useQuery({
    queryKey: ["payroll", "payslips", payslipId],
    queryFn: () =>
      fetchApiData<PayslipDetail>(`/api/payroll/payslips/${payslipId}`),
    enabled: Boolean(payslipId),
  });
}

export function usePayrollSummaryReport(periodId?: string) {
  const searchParams = new URLSearchParams();
  if (periodId) {
    searchParams.set("periodId", periodId);
  }

  return useQuery({
    queryKey: ["payroll", "reports", "summary", periodId],
    queryFn: () =>
      fetchApiData<PayrollSummaryReport>(
        `/api/payroll/reports/summary?${searchParams.toString()}`,
      ),
  });
}

export async function runPayrollForPeriod(
  periodId: string,
): Promise<RunPayrollResult> {
  return postApiData<RunPayrollResult>(
    `/api/payroll/periods/${periodId}/run`,
    {},
  );
}

export async function finalizePayslipById(
  payslipId: string,
): Promise<PayslipDetail> {
  return postApiData<PayslipDetail>(
    `/api/payroll/payslips/${payslipId}/finalize`,
    {},
  );
}
