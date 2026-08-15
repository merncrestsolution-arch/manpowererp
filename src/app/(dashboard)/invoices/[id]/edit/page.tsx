"use client";

import { use } from "react";

import { InvoiceForm } from "@/components/invoices/invoice-form";
import { PageShell } from "@/components/shared/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoice } from "@/hooks/use-invoices";

type EditInvoicePageProps = {
  params: Promise<{ id: string }>;
};

export default function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = use(params);
  const { data: invoice, isLoading, isError } = useInvoice(id);
  const canEdit =
    invoice && invoice.status !== "PAID" && invoice.status !== "CANCELLED";

  if (isLoading) {
    return (
      <PageShell title="Edit invoice" description="Loading invoice details.">
        <Skeleton className="h-96 w-full" />
      </PageShell>
    );
  }

  if (isError || !invoice) {
    return (
      <PageShell title="Edit invoice" description="Update invoice details.">
        <div className="border-border bg-card shadow-card rounded-2xl border p-8 text-center">
          <p className="font-medium">Invoice not found</p>
        </div>
      </PageShell>
    );
  }

  if (!canEdit) {
    return (
      <PageShell
        title="Edit invoice"
        description={`${invoice.invoiceNo} cannot be edited.`}
      >
        <div className="border-border bg-card shadow-card rounded-2xl border p-8 text-center">
          <p className="font-medium">
            Paid or cancelled invoices cannot be edited.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Edit invoice"
      description={`Update ${invoice.invoiceNo} for ${invoice.clientName}.`}
    >
      <InvoiceForm invoice={invoice} />
    </PageShell>
  );
}
