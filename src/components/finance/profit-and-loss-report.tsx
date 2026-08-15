"use client";

import { ProfitAndLossChart } from "@/components/finance/profit-and-loss-chart";
import { ExportToolbar } from "@/components/reports/export-toolbar";
import { formatCurrency } from "@/lib/format";

import type { ProfitAndLossReport } from "@/types/finance";

type ProfitAndLossReportViewProps = {
  report?: ProfitAndLossReport;
  isLoading?: boolean;
};

function ReportSection({
  title,
  lines,
  total,
  currency,
}: {
  title: string;
  lines: ProfitAndLossReport["revenue"];
  total: number;
  currency: string;
}) {
  return (
    <div className="rounded-lg border">
      <div className="bg-muted/40 px-jk-md py-jk-sm border-b font-medium">
        {title}
      </div>
      <div className="divide-y">
        {lines.length === 0 ? (
          <p className="px-jk-md py-jk-sm text-muted-foreground">No entries</p>
        ) : (
          lines.map((line) => (
            <div
              key={line.accountId}
              className="px-jk-md py-jk-sm flex items-center justify-between"
            >
              <span>
                {line.accountCode} — {line.accountName}
              </span>
              <span>{formatCurrency(line.amount, currency)}</span>
            </div>
          ))
        )}
      </div>
      <div className="bg-muted/20 px-jk-md py-jk-sm flex items-center justify-between border-t font-semibold">
        <span>Total {title}</span>
        <span>{formatCurrency(total, currency)}</span>
      </div>
    </div>
  );
}

export function ProfitAndLossReportView({
  report,
  isLoading = false,
}: ProfitAndLossReportViewProps) {
  if (isLoading || !report) {
    return (
      <div className="gap-jk-md grid">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-muted/40 h-40 animate-pulse rounded-lg border"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-jk-md">
      <ExportToolbar
        reportTitle="Profit & loss"
        subtitle={report.periodLabel}
        csvFilename="profit-and-loss.csv"
        csvColumns={[
          { key: "section", header: "Section" },
          { key: "account", header: "Account" },
          { key: "amount", header: "Amount" },
        ]}
        csvRows={[
          ...report.revenue.map((line) => ({
            section: "Revenue",
            account: `${line.accountCode} — ${line.accountName}`,
            amount: formatCurrency(line.amount, report.currency),
          })),
          ...report.expenses.map((line) => ({
            section: "Expense",
            account: `${line.accountCode} — ${line.accountName}`,
            amount: formatCurrency(line.amount, report.currency),
          })),
          {
            section: "Net",
            account: "Net profit",
            amount: formatCurrency(report.netProfit, report.currency),
          },
        ]}
        pdfColumns={[
          { header: "Section", width: 90 },
          { header: "Account", width: 280 },
          { header: "Amount", width: 120 },
        ]}
        pdfRows={[
          ...report.revenue.map((line) => [
            "Revenue",
            `${line.accountCode} — ${line.accountName}`,
            formatCurrency(line.amount, report.currency),
          ]),
          ...report.expenses.map((line) => [
            "Expense",
            `${line.accountCode} — ${line.accountName}`,
            formatCurrency(line.amount, report.currency),
          ]),
          [
            "Net",
            "Net profit",
            formatCurrency(report.netProfit, report.currency),
          ],
        ]}
      />
      <div className="gap-jk-md grid md:grid-cols-3">
        <div className="px-jk-md py-jk-sm rounded-lg border">
          <p className="text-label-md text-muted-foreground">Net profit</p>
          <p className="font-heading text-headline-sm">
            {formatCurrency(report.netProfit, report.currency)}
          </p>
        </div>
        <div className="px-jk-md py-jk-sm rounded-lg border">
          <p className="text-label-md text-muted-foreground">
            Previous net profit
          </p>
          <p className="font-heading text-headline-sm">
            {formatCurrency(report.previousNetProfit, report.currency)}
          </p>
        </div>
        <div className="px-jk-md py-jk-sm rounded-lg border">
          <p className="text-label-md text-muted-foreground">Period</p>
          <p className="font-medium">{report.periodLabel}</p>
          <p className="text-muted-foreground text-sm">
            vs {report.previousPeriodLabel}
          </p>
        </div>
      </div>

      <ProfitAndLossChart report={report} />

      <ReportSection
        title="Revenue"
        lines={report.revenue}
        total={report.totalRevenue}
        currency={report.currency}
      />
      <ReportSection
        title="Expenses"
        lines={report.expenses}
        total={report.totalExpenses}
        currency={report.currency}
      />

      <div className="bg-primary/5 px-jk-md py-jk-sm flex items-center justify-between rounded-lg border text-lg font-bold">
        <span>Net profit</span>
        <span>{formatCurrency(report.netProfit, report.currency)}</span>
      </div>
    </div>
  );
}
