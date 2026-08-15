"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchApiData } from "@/lib/api-client";

import type {
  BalanceSheetReport,
  CashBookEntry,
  CashFlowReport,
  ChartAccountItem,
  LedgerEntryItem,
  ProfitAndLossReport,
} from "@/types/finance";

function buildPeriodQuery(dateFrom: string, dateTo: string): string {
  const params = new URLSearchParams({ dateFrom, dateTo });
  return params.toString();
}

export function useChartAccounts() {
  return useQuery({
    queryKey: ["finance", "accounts"],
    queryFn: () => fetchApiData<ChartAccountItem[]>("/api/finance/accounts"),
  });
}

export function useChartAccount(accountId: string) {
  return useQuery({
    queryKey: ["finance", "accounts", accountId],
    queryFn: () =>
      fetchApiData<ChartAccountItem>(`/api/finance/accounts/${accountId}`),
    enabled: Boolean(accountId),
  });
}

export function useAccountLedger(
  accountId: string,
  filters: { dateFrom?: string; dateTo?: string },
) {
  const params = new URLSearchParams();
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);

  return useQuery({
    queryKey: ["finance", "ledger", accountId, filters],
    queryFn: () =>
      fetchApiData<{
        account: ChartAccountItem;
        entries: LedgerEntryItem[];
        openingBalance: number;
        closingBalance: number;
      }>(`/api/finance/accounts/${accountId}/ledger?${params.toString()}`),
    enabled: Boolean(accountId),
  });
}

export function useCashBook(filters: { dateFrom: string; dateTo: string }) {
  return useQuery({
    queryKey: ["finance", "cash-book", filters],
    queryFn: () =>
      fetchApiData<{
        entries: CashBookEntry[];
        periodLabel: string;
        currency: string;
        openingBalance: number;
        closingBalance: number;
      }>(
        `/api/finance/cash-book?${buildPeriodQuery(filters.dateFrom, filters.dateTo)}`,
      ),
    enabled: Boolean(filters.dateFrom && filters.dateTo),
  });
}

export function useProfitAndLoss(filters: {
  dateFrom: string;
  dateTo: string;
}) {
  return useQuery({
    queryKey: ["finance", "profit-and-loss", filters],
    queryFn: () =>
      fetchApiData<ProfitAndLossReport>(
        `/api/finance/reports/profit-and-loss?${buildPeriodQuery(filters.dateFrom, filters.dateTo)}`,
      ),
    enabled: Boolean(filters.dateFrom && filters.dateTo),
  });
}

export function useBalanceSheet(asOfDate: string) {
  return useQuery({
    queryKey: ["finance", "balance-sheet", asOfDate],
    queryFn: () =>
      fetchApiData<BalanceSheetReport>(
        `/api/finance/reports/balance-sheet?asOfDate=${asOfDate}`,
      ),
    enabled: Boolean(asOfDate),
  });
}

export function useCashFlow(filters: { dateFrom: string; dateTo: string }) {
  return useQuery({
    queryKey: ["finance", "cash-flow", filters],
    queryFn: () =>
      fetchApiData<CashFlowReport>(
        `/api/finance/reports/cash-flow?${buildPeriodQuery(filters.dateFrom, filters.dateTo)}`,
      ),
    enabled: Boolean(filters.dateFrom && filters.dateTo),
  });
}
