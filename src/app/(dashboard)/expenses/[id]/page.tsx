import { ExpenseDetailView } from "@/components/expenses/expense-detail-view";

type ExpenseDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExpenseDetailPage({
  params,
}: ExpenseDetailPageProps) {
  const { id } = await params;

  return (
    <div className="py-jk-md">
      <ExpenseDetailView expenseId={id} />
    </div>
  );
}
