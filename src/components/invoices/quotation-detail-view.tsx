"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Download, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ConvertToInvoiceDialog } from "@/components/invoices/convert-to-invoice-dialog";
import { QuotationStatusBadge } from "@/components/invoices/invoice-status-badge";
import { FormSection } from "@/components/shared/forms/form-section";
import { Button } from "@/components/ui/button";
import { canConvertQuotation } from "@/infrastructure/auth/roles";
import { patchApiData } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";

import type { Role } from "@/types/auth";
import type { QuotationDetail } from "@/types/invoice";

type QuotationDetailViewProps = {
  quotation: QuotationDetail;
  role?: Role;
};

export function QuotationDetailView({
  quotation,
  role,
}: QuotationDetailViewProps) {
  const queryClient = useQueryClient();
  const [convertOpen, setConvertOpen] = useState(false);
  const canConvert = role ? canConvertQuotation(role) : false;

  const sendQuotation = async () => {
    await patchApiData(`/api/invoices/quotations/${quotation.id}`, {
      status: "SENT",
    });
    await queryClient.invalidateQueries({
      queryKey: ["quotations", quotation.id],
    });
  };

  const canShowConvert =
    canConvert &&
    quotation.status !== "CONVERTED" &&
    quotation.status !== "REJECTED" &&
    quotation.status !== "EXPIRED";

  return (
    <div className="gap-jk-lg mx-auto flex max-w-4xl flex-col">
      <div className="gap-jk-sm flex flex-wrap items-start justify-between">
        <div>
          <div className="gap-jk-sm flex items-center">
            <h1 className="font-heading text-headline-md">
              {quotation.quotationNo}
            </h1>
            <QuotationStatusBadge status={quotation.status} />
          </div>
          <p className="text-body-md text-muted-foreground">
            {quotation.clientName}
          </p>
        </div>
        <div className="gap-jk-sm flex flex-wrap">
          <Button
            variant="outline"
            render={<Link href="/invoices/quotations" />}
          >
            Back
          </Button>
          {quotation.status !== "CONVERTED" ? (
            <Button
              variant="outline"
              render={
                <Link href={`/invoices/quotations/${quotation.id}/edit`} />
              }
            >
              <Pencil className="size-4" />
              Edit
            </Button>
          ) : null}
          <Button
            variant="outline"
            render={
              <a
                href={`/api/invoices/quotations/${quotation.id}/pdf`}
                download
              />
            }
          >
            <Download className="size-4" />
            Download PDF
          </Button>
          {quotation.status === "DRAFT" ? (
            <Button onClick={sendQuotation}>Mark as sent</Button>
          ) : null}
          {canShowConvert ? (
            <Button onClick={() => setConvertOpen(true)}>
              Convert to invoice
            </Button>
          ) : null}
        </div>
      </div>

      <div className="gap-jk-md grid md:grid-cols-3">
        <FormSection title="Issue date">
          <p>{new Date(quotation.issueDate).toLocaleDateString("en-LK")}</p>
        </FormSection>
        <FormSection title="Valid until">
          <p>{new Date(quotation.validUntil).toLocaleDateString("en-LK")}</p>
        </FormSection>
        <FormSection title="Total">
          <p className="font-heading text-headline-sm">
            {formatCurrency(quotation.total, "LKR")}
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
              {quotation.lineItems.map((item) => (
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
            <p>Subtotal: {formatCurrency(quotation.subtotal, "LKR")}</p>
            <p>Tax: {formatCurrency(quotation.taxAmount, "LKR")}</p>
            <p className="font-medium">
              Total: {formatCurrency(quotation.total, "LKR")}
            </p>
          </div>
        </div>
      </FormSection>

      {quotation.notes ? (
        <FormSection title="Notes">
          <p className="text-muted-foreground text-sm">{quotation.notes}</p>
        </FormSection>
      ) : null}

      <ConvertToInvoiceDialog
        quotationId={quotation.id}
        open={convertOpen}
        onOpenChange={setConvertOpen}
      />
    </div>
  );
}
