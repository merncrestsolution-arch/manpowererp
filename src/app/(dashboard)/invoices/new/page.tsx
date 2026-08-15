import { InvoiceForm } from "@/components/invoices/invoice-form";
import { PageShell } from "@/components/shared/page-shell";

export default function NewInvoicePage() {
  return (
    <PageShell
      title="New invoice"
      description="Create an invoice with line items and payment terms."
    >
      <InvoiceForm />
    </PageShell>
  );
}
