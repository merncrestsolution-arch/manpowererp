"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { PaymentHistoryTable } from "@/components/invoices/payment-history-table";
import { RecordPaymentDialog } from "@/components/invoices/record-payment-dialog";
import { FormSection } from "@/components/shared/forms/form-section";
import { Button } from "@/components/ui/button";
import { canRecordPayments } from "@/infrastructure/auth/roles";
import { patchApiData } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";

import type { Role } from "@/types/auth";
import type { InvoiceDetail } from "@/types/invoice";

type InvoiceDetailViewProps = {
  invoice: InvoiceDetail;
  role?: Role;
};

export function InvoiceDetailView({ invoice, role }: InvoiceDetailViewProps) {
  const queryClient = useQueryClient();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const canPay = role ? canRecordPayments(role) : false;

  const sendInvoice = async () => {
    await patchApiData(`/api/invoices/${invoice.id}`, { status: "SENT" });
    await queryClient.invalidateQueries({ queryKey: ["invoices", invoice.id] });
  };

  return (
    <div className="gap-jk-lg mx-auto flex max-w-4xl flex-col">
      <div className="gap-jk-sm flex flex-wrap items-start justify-between">
        <div>
          <div className="gap-jk-sm flex items-center">
            <h1 className="font-heading text-headline-md">
              {invoice.invoiceNo}
            </h1>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="text-body-md text-muted-foreground">
            {invoice.clientName}
          </p>
        </div>
        <div className="gap-jk-sm flex flex-wrap">
          <Button variant="outline" render={<Link href="/invoices" />}>
            Back
          </Button>
          {invoice.status !== "PAID" && invoice.status !== "CANCELLED" ? (
            <Button
              variant="outline"
              render={<Link href={`/invoices/${invoice.id}/edit`} />}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
          ) : null}
          <Button
            variant="outline"
            render={<a href={`/api/invoices/${invoice.id}/pdf`} download />}
          >
            <Download className="size-4" />
            Download PDF
          </Button>
          {invoice.status === "DRAFT" ? (
            <Button onClick={sendInvoice}>
              <FileText className="size-4" />
              Mark as sent
            </Button>
          ) : null}
          {canPay && invoice.amountDue > 0 && invoice.status !== "CANCELLED" ? (
            <Button onClick={() => setPaymentOpen(true)}>Record payment</Button>
          ) : null}
        </div>
      </div>

      <div className="gap-jk-md grid md:grid-cols-3">
        <FormSection title="Issue date">
          <p>{new Date(invoice.issueDate).toLocaleDateString("en-LK")}</p>
        </FormSection>
        <FormSection title="Due date">
          <p>{new Date(invoice.dueDate).toLocaleDateString("en-LK")}</p>
        </FormSection>
        <FormSection title="Total">
          <p className="font-heading text-headline-sm">
            {formatCurrency(invoice.total, "LKR")}
          </p>
        </FormSection>
      </div>

      <FormSection title="Line items">
        <div className="border-border overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Description</th>
                <th className="px-3 py-2 text-right font-medium">Qty</th>
                <th className="px-3 py-2 text-right font-medium">Unit</th>
                <th className="px-3 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr key={item.id} className="border-border border-t">
                  <td className="px-3 py-2">{item.description}</td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-right">
                    {formatCurrency(item.unitPrice, "LKR")}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatCurrency(item.lineTotal, "LKR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-jk-md flex justify-end">
          <div className="space-y-1 text-right text-sm">
            <p>Subtotal: {formatCurrency(invoice.subtotal, "LKR")}</p>
            <p>Tax: {formatCurrency(invoice.taxAmount, "LKR")}</p>
            <p className="font-medium">
              Total: {formatCurrency(invoice.total, "LKR")}
            </p>
            <p>Paid: {formatCurrency(invoice.amountPaid, "LKR")}</p>
            <p className="text-jk-primary font-medium">
              Due: {formatCurrency(invoice.amountDue, "LKR")}
            </p>
          </div>
        </div>
      </FormSection>

      {invoice.notes ? (
        <FormSection title="Notes">
          <p className="text-muted-foreground text-sm">{invoice.notes}</p>
        </FormSection>
      ) : null}

      <FormSection title="Payment history">
        <PaymentHistoryTable payments={invoice.payments} />
      </FormSection>

      <RecordPaymentDialog
        invoiceId={invoice.id}
        amountDue={invoice.amountDue}
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
      />
    </div>
  );
}
