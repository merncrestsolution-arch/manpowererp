"use client";

import Link from "next/link";
import { useState } from "react";

import { CashFlowChart } from "@/components/finance/cash-flow-chart";
import { ProfitAndLossReportView } from "@/components/finance/profit-and-loss-report";
import { OutstandingAgingChart } from "@/components/invoices/outstanding-aging-chart";
import { OutstandingAgingTable } from "@/components/invoices/outstanding-aging-table";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { useCashFlow, useProfitAndLoss } from "@/hooks/use-finance";
import { useOutstandingReport } from "@/hooks/use-invoices";
import { getDefaultMonthDateRange } from "@/lib/finance-dates";
import { formatCurrency } from "@/lib/format";

export default function ReportsFinancePage() {
  const [filters, setFilters] = useState(getDefaultMonthDateRange);
  const { data: outstanding, isLoading: outstandingLoading } =
    useOutstandingReport();
  const { data: profitAndLoss, isLoading: plLoading } =
    useProfitAndLoss(filters);
  const { data: cashFlow, isLoading: cashFlowLoading } = useCashFlow(filters);

  return (
    <PageShell
      title="Invoices & finance"
      description="Outstanding receivables, profit & loss, and cash flow"
      actions={
        <Button variant="outline" render={<Link href="/reports" />}>
          Back to reports
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              dateFrom: event.target.value,
            }))
          }
          className="border-input bg-background h-9 rounded-lg border px-3 text-sm"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              dateTo: event.target.value,
            }))
          }
          className="border-input bg-background h-9 rounded-lg border px-3 text-sm"
        />
      </div>

      {outstanding ? (
        <div className="gap-jk-md grid md:grid-cols-3">
          <div className="border-border bg-card p-jk-md shadow-card rounded-lg border">
            <p className="text-muted-foreground text-sm">Total outstanding</p>
            <p className="font-heading text-headline-md">
              {formatCurrency(
                outstanding.totals.totalOutstanding,
                outstanding.currency,
              )}
            </p>
          </div>
          <div className="border-border bg-card p-jk-md shadow-card rounded-lg border">
            <p className="text-muted-foreground text-sm">Overdue (30+ days)</p>
            <p className="font-heading text-headline-md">
              {formatCurrency(
                outstanding.totals.days31to60 +
                  outstanding.totals.days61to90 +
                  outstanding.totals.days90plus,
                outstanding.currency,
              )}
            </p>
          </div>
          <div className="border-border bg-card p-jk-md shadow-card rounded-lg border">
            <p className="text-muted-foreground text-sm">As of</p>
            <p className="font-heading text-headline-md">
              {new Date(outstanding.asOfDate).toLocaleDateString("en-LK")}
            </p>
          </div>
        </div>
      ) : null}

      <OutstandingAgingChart
        report={outstanding}
        isLoading={outstandingLoading}
      />
      <OutstandingAgingTable report={outstanding} />
      <ProfitAndLossReportView report={profitAndLoss} isLoading={plLoading} />
      <CashFlowChart report={cashFlow} isLoading={cashFlowLoading} />
    </PageShell>
  );
}
