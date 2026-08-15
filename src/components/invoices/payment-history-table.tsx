"use client";

import { formatCurrency } from "@/lib/format";

import type { PaymentListItem } from "@/types/invoice";

type PaymentHistoryTableProps = {
  payments: PaymentListItem[];
};

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  if (payments.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No payments recorded yet.</p>
    );
  }

  return (
    <div className="border-border overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Payment No</th>
            <th className="px-3 py-2 text-left font-medium">Date</th>
            <th className="px-3 py-2 text-left font-medium">Method</th>
            <th className="px-3 py-2 text-left font-medium">Reference</th>
            <th className="px-3 py-2 text-right font-medium">Amount</th>
            <th className="px-3 py-2 text-left font-medium">Recorded by</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-border border-t">
              <td className="px-3 py-2 font-medium">{payment.paymentNo}</td>
              <td className="px-3 py-2">
                {new Date(payment.paymentDate).toLocaleDateString("en-LK")}
              </td>
              <td className="px-3 py-2">
                {payment.method.replaceAll("_", " ")}
              </td>
              <td className="px-3 py-2">{payment.reference ?? "—"}</td>
              <td className="px-3 py-2 text-right">
                {formatCurrency(payment.amount, "LKR")}
              </td>
              <td className="px-3 py-2">{payment.recordedByName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
