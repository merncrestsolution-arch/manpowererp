import Link from "next/link";

import { ExpenseReportsPageContent } from "@/components/expenses/expense-reports-page-content";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";

export default function ExpenseReportsPage() {
  return (
    <PageShell
      title="Expense reports"
      description="Analyze spending by category and period"
      actions={
        <Button
          variant="outline"
          className="h-9"
          render={<Link href="/expenses" />}
        >
          Back
        </Button>
      }
    >
      <ExpenseReportsPageContent />
    </PageShell>
  );
}
