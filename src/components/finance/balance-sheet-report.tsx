"use client";

import { BalanceCheckIndicator } from "@/components/finance/balance-check-indicator";
import { ExportToolbar } from "@/components/reports/export-toolbar";
import { formatCurrency } from "@/lib/format";

import type { BalanceSheetReport } from "@/types/finance";

type BalanceSheetReportViewProps = {
  report?: BalanceSheetReport;
  isLoading?: boolean;
};

function Section({
  title,
  lines,
  total,
  currency,
}: {
  title: string;
  lines: BalanceSheetReport["assets"];
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
              <span>{formatCurrency(line.balance, currency)}</span>
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

export function BalanceSheetReportView({
  report,
  isLoading = false,
}: BalanceSheetReportViewProps) {
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
        reportTitle="Balance sheet"
        subtitle={`As of ${report.asOfDate}`}
        csvFilename="balance-sheet.csv"
        csvColumns={[
          { key: "section", header: "Section" },
          { key: "account", header: "Account" },
          { key: "balance", header: "Balance" },
        ]}
        csvRows={[
          ...report.assets.map((line) => ({
            section: "Assets",
            account: `${line.accountCode} — ${line.accountName}`,
            balance: formatCurrency(line.balance, report.currency),
          })),
          ...report.liabilities.map((line) => ({
            section: "Liabilities",
            account: `${line.accountCode} — ${line.accountName}`,
            balance: formatCurrency(line.balance, report.currency),
          })),
          ...report.equity.map((line) => ({
            section: "Equity",
            account: `${line.accountCode} — ${line.accountName}`,
            balance: formatCurrency(line.balance, report.currency),
          })),
        ]}
        pdfColumns={[
          { header: "Section", width: 90 },
          { header: "Account", width: 280 },
          { header: "Balance", width: 120 },
        ]}
        pdfRows={[
          ...report.assets.map((line) => [
            "Assets",
            `${line.accountCode} — ${line.accountName}`,
            formatCurrency(line.balance, report.currency),
          ]),
          ...report.liabilities.map((line) => [
            "Liabilities",
            `${line.accountCode} — ${line.accountName}`,
            formatCurrency(line.balance, report.currency),
          ]),
          ...report.equity.map((line) => [
            "Equity",
            `${line.accountCode} — ${line.accountName}`,
            formatCurrency(line.balance, report.currency),
          ]),
        ]}
      />
      <BalanceCheckIndicator
        isBalanced={report.isBalanced}
        difference={report.difference}
        currency={report.currency}
      />

      <Section
        title="Assets"
        lines={report.assets}
        total={report.totalAssets}
        currency={report.currency}
      />
      <Section
        title="Liabilities"
        lines={report.liabilities}
        total={report.totalLiabilities}
        currency={report.currency}
      />
      <Section
        title="Equity"
        lines={report.equity}
        total={report.totalEquity}
        currency={report.currency}
      />

      <div className="gap-jk-sm grid md:grid-cols-2">
        <div className="px-jk-md py-jk-sm rounded-lg border font-semibold">
          Assets: {formatCurrency(report.totalAssets, report.currency)}
        </div>
        <div className="px-jk-md py-jk-sm rounded-lg border font-semibold">
          Liabilities + Equity:{" "}
          {formatCurrency(
            report.totalLiabilities + report.totalEquity,
            report.currency,
          )}
        </div>
      </div>
    </div>
  );
}
