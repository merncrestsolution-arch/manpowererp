import { QuotationDetailPageContent } from "@/components/invoices/quotation-detail-page-content";

type QuotationDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuotationDetailPage({
  params,
}: QuotationDetailPageProps) {
  const { id } = await params;
  return <QuotationDetailPageContent quotationId={id} />;
}
