import { InvoiceDetailPageContent } from "@/components/invoices/invoice-detail-page-content";

type InvoiceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const { id } = await params;
  return <InvoiceDetailPageContent invoiceId={id} />;
}
