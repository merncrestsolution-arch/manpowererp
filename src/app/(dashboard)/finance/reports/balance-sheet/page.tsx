"use client";

import Link from "next/link";
import { useState } from "react";

import { BalanceSheetReportView } from "@/components/finance/balance-sheet-report";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { useBalanceSheet } from "@/hooks/use-finance";
import { getTodayDateString } from "@/lib/finance-dates";

export default function BalanceSheetPage() {
  const [asOfDate, setAsOfDate] = useState(getTodayDateString);
  const { data: report, isLoading } = useBalanceSheet(asOfDate);

  return (
    <PageShell
      title="Balance sheet"
      description="Assets, liabilities, and equity as of a selected date"
      actions={
        <Button variant="outline" render={<Link href="/finance" />}>
          Back
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={asOfDate}
          onChange={(event) => setAsOfDate(event.target.value)}
          className="border-input bg-background h-9 rounded-lg border px-3 text-sm"
        />
      </div>

      <BalanceSheetReportView report={report} isLoading={isLoading} />
    </PageShell>
  );
}
