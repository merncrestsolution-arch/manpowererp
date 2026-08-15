import { QuotationForm } from "@/components/invoices/quotation-form";
import { PageShell } from "@/components/shared/page-shell";

export default function NewQuotationPage() {
  return (
    <PageShell
      title="New quotation"
      description="Create a quotation that can later be converted to an invoice."
    >
      <QuotationForm />
    </PageShell>
  );
}
