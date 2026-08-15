"use client";

import { Download, Pencil } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { ExpenseApprovalHistory } from "@/components/expenses/expense-approval-history";
import { ExpenseRejectDialog } from "@/components/expenses/expense-reject-dialog";
import { ExpenseStatusBadge } from "@/components/expenses/expense-status-badge";
import { FormSection } from "@/components/shared/forms/form-section";
import { Button } from "@/components/ui/button";
import { useExpense } from "@/hooks/use-expenses";
import { canApproveExpense } from "@/infrastructure/auth/roles";
import { postApiData } from "@/lib/api-client";
import { formatColomboDate } from "@/lib/date";
import { formatCurrency } from "@/lib/format";
import { UploadDropzone } from "@/lib/uploadthing";

import type { ExpenseDetail } from "@/types/expense";

type ExpenseDetailViewProps = {
  expenseId: string;
};

export function ExpenseDetailView({ expenseId }: ExpenseDetailViewProps) {
  const { data: session } = useSession();
  const { data, refetch, isLoading } = useExpense(expenseId);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const canApprove = session?.user?.role
    ? canApproveExpense(session.user.role)
    : false;

  if (isLoading || !data) {
    return <p className="text-muted-foreground">Loading expense...</p>;
  }

  const { expense, history } = data;

  const handleApprove = async () => {
    setActionError(null);
    try {
      await postApiData<ExpenseDetail>(
        `/api/expenses/${expense.id}/approve`,
        {},
      );
      await refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to approve");
    }
  };

  return (
    <div className="max-w-container gap-jk-md mx-auto flex flex-col">
      <div className="gap-jk-sm flex flex-wrap items-center justify-between">
        <div>
          <h1 className="font-heading text-headline-md text-foreground">
            {expense.expenseNo}
          </h1>
          <p className="text-body-md text-muted-foreground">
            Submitted by {expense.paidByName}
          </p>
        </div>
        <div className="gap-jk-sm flex flex-wrap items-center">
          <ExpenseStatusBadge status={expense.status} />
          <Button variant="outline" render={<Link href="/expenses" />}>
            Back to list
          </Button>
          {expense.status === "PENDING" || expense.status === "REJECTED" ? (
            <Button
              variant="outline"
              render={<Link href={`/expenses/${expense.id}/edit`} />}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
          ) : null}
          <Button
            variant="outline"
            render={<a href={`/api/expenses/${expense.id}/pdf`} download />}
          >
            <Download className="size-4" />
            Download PDF
          </Button>
          {canApprove && expense.status === "PENDING" ? (
            <>
              <Button variant="outline" onClick={() => setRejectOpen(true)}>
                Reject
              </Button>
              <Button onClick={handleApprove}>Approve</Button>
            </>
          ) : null}
        </div>
      </div>

      {actionError ? <p className="text-destructive">{actionError}</p> : null}

      <div className="gap-jk-md grid lg:grid-cols-2">
        <FormSection title="Expense information">
          <dl className="gap-jk-sm text-body-md grid">
            <div className="gap-jk-sm flex justify-between">
              <dt className="text-muted-foreground">Category</dt>
              <dd>{expense.categoryName}</dd>
            </div>
            <div className="gap-jk-sm flex justify-between">
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-medium">{formatCurrency(expense.amount)}</dd>
            </div>
            <div className="gap-jk-sm flex justify-between">
              <dt className="text-muted-foreground">Date</dt>
              <dd>{formatColomboDate(new Date(expense.expenseDate))}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Description</dt>
              <dd className="mt-1">{expense.description}</dd>
            </div>
            {expense.approvedByName ? (
              <div className="gap-jk-sm flex justify-between">
                <dt className="text-muted-foreground">Reviewed by</dt>
                <dd>{expense.approvedByName}</dd>
              </div>
            ) : null}
            {expense.rejectionReason ? (
              <div>
                <dt className="text-muted-foreground">Rejection reason</dt>
                <dd className="text-destructive mt-1">
                  {expense.rejectionReason}
                </dd>
              </div>
            ) : null}
          </dl>
        </FormSection>

        <FormSection title="Receipt">
          {expense.receiptUrl ? (
            <div className="space-y-jk-sm">
              <a
                href={expense.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="text-jk-primary underline"
              >
                View receipt
              </a>
            </div>
          ) : (
            <div className="space-y-jk-md">
              <p className="text-body-md text-muted-foreground">
                No receipt uploaded yet.
              </p>
              <UploadDropzone
                endpoint="expenseReceipt"
                input={{ expenseId: expense.id }}
                onClientUploadComplete={() => {
                  void refetch();
                }}
              />
            </div>
          )}
        </FormSection>
      </div>

      <FormSection title="Approval history">
        <ExpenseApprovalHistory history={history} />
      </FormSection>

      <ExpenseRejectDialog
        expenseId={expense.id}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onRejected={() => refetch()}
      />
    </div>
  );
}
