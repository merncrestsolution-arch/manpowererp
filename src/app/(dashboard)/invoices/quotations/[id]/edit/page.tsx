"use client";

import { use } from "react";

import { QuotationForm } from "@/components/invoices/quotation-form";
import { PageShell } from "@/components/shared/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuotation } from "@/hooks/use-invoices";

type EditQuotationPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditQuotationPage({ params }: EditQuotationPageProps) {
  const { id } = use(params);
  const { data: quotation, isLoading, isError } = useQuotation(id);
  const canEdit = quotation && quotation.status !== "CONVERTED";

  if (isLoading) {
    return (
      <PageShell
        title="Edit quotation"
        description="Loading quotation details."
      >
        <Skeleton className="h-96 w-full" />
      </PageShell>
    );
  }

  if (isError || !quotation) {
    return (
      <PageShell title="Edit quotation" description="Update quotation details.">
        <div className="border-border bg-card shadow-card rounded-2xl border p-8 text-center">
          <p className="font-medium">Quotation not found</p>
        </div>
      </PageShell>
    );
  }

  if (!canEdit) {
    return (
      <PageShell
        title="Edit quotation"
        description={`${quotation.quotationNo} cannot be edited.`}
      >
        <div className="border-border bg-card shadow-card rounded-2xl border p-8 text-center">
          <p className="font-medium">Converted quotations cannot be edited.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Edit quotation"
      description={`Update ${quotation.quotationNo} for ${quotation.clientName}.`}
    >
      <QuotationForm quotation={quotation} />
    </PageShell>
  );
}
