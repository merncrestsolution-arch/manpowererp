import { ExpenseForm } from "@/components/expenses/expense-form";
import { PageShell } from "@/components/shared/page-shell";

export default function NewExpensePage() {
  return (
    <PageShell title="Submit expense">
      <ExpenseForm />
    </PageShell>
  );
}
