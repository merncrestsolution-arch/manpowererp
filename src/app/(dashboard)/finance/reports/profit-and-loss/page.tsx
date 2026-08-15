"use client";

import Link from "next/link";
import { useState } from "react";

import { ProfitAndLossReportView } from "@/components/finance/profit-and-loss-report";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { useProfitAndLoss } from "@/hooks/use-finance";
import { getDefaultMonthDateRange } from "@/lib/finance-dates";

export default function ProfitAndLossPage() {
  const [filters, setFilters] = useState(getDefaultMonthDateRange);
  const { data: report, isLoading } = useProfitAndLoss(filters);

  return (
    <PageShell
      title="Profit & loss"
      description="Revenue minus expenses with prior-period comparison"
      actions={
        <Button variant="outline" render={<Link href="/finance" />}>
          Back
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

      <ProfitAndLossReportView report={report} isLoading={isLoading} />
    </PageShell>
  );
}
