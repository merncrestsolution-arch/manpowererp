"use client";

import { useSession } from "next-auth/react";

import { QuotationDetailView } from "@/components/invoices/quotation-detail-view";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuotation } from "@/hooks/use-invoices";

type QuotationDetailPageContentProps = {
  quotationId: string;
};

export function QuotationDetailPageContent({
  quotationId,
}: QuotationDetailPageContentProps) {
  const { data: session } = useSession();
  const { data: quotation, isLoading } = useQuotation(quotationId);

  if (isLoading) {
    return (
      <div className="space-y-jk-md mx-auto max-w-4xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!quotation) {
    return <p className="text-muted-foreground">Quotation not found.</p>;
  }

  return (
    <QuotationDetailView quotation={quotation} role={session?.user?.role} />
  );
}
