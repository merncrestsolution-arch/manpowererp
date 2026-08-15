"use client";

import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { ExportToolbar } from "@/components/reports/export-toolbar";
import { formatCurrency } from "@/lib/format";

import type { ExpenseReportSummary } from "@/types/expense";

type ExpenseReportSummaryProps = {
  report?: ExpenseReportSummary;
  isLoading?: boolean;
};

export function ExpenseReportSummary({
  report,
  isLoading = false,
}: ExpenseReportSummaryProps) {
  if (isLoading || !report) {
    return (
      <div className="gap-jk-md grid md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-muted/40 h-28 animate-pulse rounded-lg border"
          />
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Total", value: report.totalAmount },
    { label: "Approved", value: report.approvedAmount },
    { label: "Pending", value: report.pendingAmount },
    { label: "Rejected", value: report.rejectedAmount },
  ];

  return (
    <div className="space-y-jk-md">
      <ExportToolbar
        reportTitle="Expense report"
        subtitle={report.periodLabel}
        csvFilename="expense-report.csv"
        csvColumns={[
          { key: "category", header: "Category" },
          { key: "amount", header: "Amount" },
        ]}
        csvRows={[
          ...report.byCategory.map((row) => ({
            category: row.label,
            amount: formatCurrency(row.value, report.currency),
          })),
          {
            category: "Total",
            amount: formatCurrency(report.totalAmount, report.currency),
          },
        ]}
        pdfColumns={[
          { header: "Category", width: 280 },
          { header: "Amount", width: 140 },
        ]}
        pdfRows={[
          ...report.byCategory.map((row) => [
            row.label,
            formatCurrency(row.value, report.currency),
          ]),
          ["Total", formatCurrency(report.totalAmount, report.currency)],
        ]}
      />
      <div className="gap-jk-md grid md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-card px-jk-md py-jk-sm shadow-card rounded-lg border"
          >
            <p className="text-label-md text-muted-foreground">{card.label}</p>
            <p className="font-heading text-headline-sm">
              {formatCurrency(card.value, report.currency)}
            </p>
          </div>
        ))}
      </div>

      <ExpenseChart
        data={report.byCategory}
        periodLabel={report.periodLabel}
        currency={report.currency}
        isLoading={false}
      />
    </div>
  );
}
