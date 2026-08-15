"use client";

import Link from "next/link";

import { ExportToolbar } from "@/components/reports/export-toolbar";
import { formatCurrency } from "@/lib/format";

import type { OutstandingReport } from "@/types/invoice";

type OutstandingAgingTableProps = {
  report?: OutstandingReport;
};

export function OutstandingAgingTable({ report }: OutstandingAgingTableProps) {
  if (!report) {
    return null;
  }

  return (
    <div className="space-y-jk-lg">
      <ExportToolbar
        reportTitle="Outstanding receivables"
        subtitle={`As of ${new Date(report.asOfDate).toLocaleDateString("en-LK")}`}
        csvFilename="outstanding-receivables.csv"
        csvColumns={[
          { key: "invoiceNo", header: "Invoice" },
          { key: "clientName", header: "Client" },
          { key: "dueDate", header: "Due date" },
          { key: "bucket", header: "Bucket" },
          { key: "amountDue", header: "Amount due" },
        ]}
        csvRows={report.invoices.map((invoice) => ({
          invoiceNo: invoice.invoiceNo,
          clientName: invoice.clientName,
          dueDate: new Date(invoice.dueDate).toLocaleDateString("en-LK"),
          bucket: invoice.bucket,
          amountDue: formatCurrency(invoice.amountDue, report.currency),
        }))}
        pdfColumns={[
          { header: "Invoice", width: 110 },
          { header: "Client", width: 150 },
          { header: "Due date", width: 90 },
          { header: "Bucket", width: 70 },
          { header: "Amount due", width: 100 },
        ]}
        pdfRows={report.invoices.map((invoice) => [
          invoice.invoiceNo,
          invoice.clientName,
          new Date(invoice.dueDate).toLocaleDateString("en-LK"),
          invoice.bucket,
          formatCurrency(invoice.amountDue, report.currency),
        ])}
      />
      <div className="border-border overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Client</th>
              <th className="px-3 py-2 text-right font-medium">Current</th>
              <th className="px-3 py-2 text-right font-medium">1-30</th>
              <th className="px-3 py-2 text-right font-medium">31-60</th>
              <th className="px-3 py-2 text-right font-medium">61-90</th>
              <th className="px-3 py-2 text-right font-medium">90+</th>
              <th className="px-3 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {report.byClient.map((row) => (
              <tr key={row.clientId} className="border-border border-t">
                <td className="px-3 py-2 font-medium">{row.clientName}</td>
                <td className="px-3 py-2 text-right">
                  {formatCurrency(row.current, report.currency)}
                </td>
                <td className="px-3 py-2 text-right">
                  {formatCurrency(row.days1to30, report.currency)}
                </td>
                <td className="px-3 py-2 text-right">
                  {formatCurrency(row.days31to60, report.currency)}
                </td>
                <td className="px-3 py-2 text-right">
                  {formatCurrency(row.days61to90, report.currency)}
                </td>
                <td className="px-3 py-2 text-right">
                  {formatCurrency(row.days90plus, report.currency)}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {formatCurrency(row.totalOutstanding, report.currency)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/30">
            <tr className="border-border border-t font-medium">
              <td className="px-3 py-2">Total</td>
              <td className="px-3 py-2 text-right">
                {formatCurrency(report.totals.current, report.currency)}
              </td>
              <td className="px-3 py-2 text-right">
                {formatCurrency(report.totals.days1to30, report.currency)}
              </td>
              <td className="px-3 py-2 text-right">
                {formatCurrency(report.totals.days31to60, report.currency)}
              </td>
              <td className="px-3 py-2 text-right">
                {formatCurrency(report.totals.days61to90, report.currency)}
              </td>
              <td className="px-3 py-2 text-right">
                {formatCurrency(report.totals.days90plus, report.currency)}
              </td>
              <td className="px-3 py-2 text-right">
                {formatCurrency(
                  report.totals.totalOutstanding,
                  report.currency,
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="border-border overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Invoice</th>
              <th className="px-3 py-2 text-left font-medium">Client</th>
              <th className="px-3 py-2 text-left font-medium">Due date</th>
              <th className="px-3 py-2 text-left font-medium">Bucket</th>
              <th className="px-3 py-2 text-right font-medium">Amount due</th>
            </tr>
          </thead>
          <tbody>
            {report.invoices.map((invoice) => (
              <tr key={invoice.id} className="border-border border-t">
                <td className="px-3 py-2">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="text-jk-primary font-medium hover:underline"
                  >
                    {invoice.invoiceNo}
                  </Link>
                </td>
                <td className="px-3 py-2">{invoice.clientName}</td>
                <td className="px-3 py-2">
                  {new Date(invoice.dueDate).toLocaleDateString("en-LK")}
                </td>
                <td className="px-3 py-2">{invoice.bucket}</td>
                <td className="px-3 py-2 text-right">
                  {formatCurrency(invoice.amountDue, report.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
