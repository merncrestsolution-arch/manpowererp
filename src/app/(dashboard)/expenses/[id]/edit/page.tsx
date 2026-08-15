"use client";

import { use } from "react";

import { ExpenseForm } from "@/components/expenses/expense-form";
import { PageShell } from "@/components/shared/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useExpense } from "@/hooks/use-expenses";

type EditExpensePageProps = {
  params: Promise<{ id: string }>;
};

export default function EditExpensePage({ params }: EditExpensePageProps) {
  const { id } = use(params);
  const { data, isLoading, isError } = useExpense(id);
  const expense = data?.expense;
  const canEdit =
    expense && (expense.status === "PENDING" || expense.status === "REJECTED");

  if (isLoading) {
    return (
      <PageShell title="Edit expense" description="Loading expense details.">
        <Skeleton className="h-64 w-full" />
      </PageShell>
    );
  }

  if (isError || !expense) {
    return (
      <PageShell title="Edit expense" description="Update this expense bill.">
        <div className="border-border bg-card shadow-card rounded-2xl border p-8 text-center">
          <p className="font-medium">Expense not found</p>
        </div>
      </PageShell>
    );
  }

  if (!canEdit) {
    return (
      <PageShell
        title="Edit expense"
        description={`${expense.expenseNo} cannot be edited.`}
      >
        <div className="border-border bg-card shadow-card rounded-2xl border p-8 text-center">
          <p className="font-medium">
            Approved or paid expenses cannot be edited.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Edit expense"
      description={`Update ${expense.expenseNo}.`}
    >
      <ExpenseForm expense={expense} />
    </PageShell>
  );
}
