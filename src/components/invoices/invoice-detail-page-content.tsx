"use client";

import { useSession } from "next-auth/react";

import { InvoiceDetailView } from "@/components/invoices/invoice-detail-view";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoice } from "@/hooks/use-invoices";

type InvoiceDetailPageContentProps = {
  invoiceId: string;
};

export function InvoiceDetailPageContent({
  invoiceId,
}: InvoiceDetailPageContentProps) {
  const { data: session } = useSession();
  const { data: invoice, isLoading } = useInvoice(invoiceId);

  if (isLoading) {
    return (
      <div className="space-y-jk-md mx-auto max-w-4xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!invoice) {
    return <p className="text-muted-foreground">Invoice not found.</p>;
  }

  return <InvoiceDetailView invoice={invoice} role={session?.user?.role} />;
}
