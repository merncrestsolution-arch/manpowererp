"use client";

import Link from "next/link";

import { OutstandingAgingChart } from "@/components/invoices/outstanding-aging-chart";
import { OutstandingAgingTable } from "@/components/invoices/outstanding-aging-table";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { useOutstandingReport } from "@/hooks/use-invoices";
import { formatCurrency } from "@/lib/format";

export default function OutstandingPage() {
  const { data: report, isLoading } = useOutstandingReport();

  return (
    <PageShell
      title="Outstanding receivables"
      description="Aging analysis of unpaid client invoices"
      actions={
        <Button variant="outline" render={<Link href="/invoices" />}>
          Back to invoices
        </Button>
      }
    >
      {report ? (
        <div className="gap-jk-md grid md:grid-cols-3">
          <div className="border-border bg-card p-jk-md shadow-card rounded-lg border">
            <p className="text-muted-foreground text-sm">Total outstanding</p>
            <p className="font-heading text-headline-md">
              {formatCurrency(report.totals.totalOutstanding, report.currency)}
            </p>
          </div>
          <div className="border-border bg-card p-jk-md shadow-card rounded-lg border">
            <p className="text-muted-foreground text-sm">Overdue (30+ days)</p>
            <p className="font-heading text-headline-md">
              {formatCurrency(
                report.totals.days31to60 +
                  report.totals.days61to90 +
                  report.totals.days90plus,
                report.currency,
              )}
            </p>
          </div>
          <div className="border-border bg-card p-jk-md shadow-card rounded-lg border">
            <p className="text-muted-foreground text-sm">As of</p>
            <p className="font-heading text-headline-md">
              {new Date(report.asOfDate).toLocaleDateString("en-LK")}
            </p>
          </div>
        </div>
      ) : null}

      <OutstandingAgingChart report={report} isLoading={isLoading} />
      <OutstandingAgingTable report={report} />
    </PageShell>
  );
}
