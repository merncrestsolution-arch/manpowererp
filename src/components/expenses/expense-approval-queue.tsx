"use client";

import {
  Check,
  ClipboardCheck,
  Eye,
  Paperclip,
  Receipt,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ExpenseRejectDialog } from "@/components/expenses/expense-reject-dialog";
import { ExpenseStatusBadge } from "@/components/expenses/expense-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePendingExpenses } from "@/hooks/use-expenses";
import { postApiData } from "@/lib/api-client";
import { formatColomboDate } from "@/lib/date";
import { formatCurrency } from "@/lib/format";

import type { ExpenseDetail, ExpenseListItem } from "@/types/expense";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function QueueCard({
  expense,
  isApproving,
  onApprove,
  onReject,
}: {
  expense: ExpenseListItem;
  isApproving: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <article className="border-border bg-card shadow-card hover:border-primary/35 rounded-2xl border p-5 transition-colors">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="jk-icon-well mt-0.5">
            <Receipt className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/expenses/${expense.id}`}
                className="font-heading text-foreground hover:text-primary text-[16px] leading-6 font-semibold"
              >
                {expense.expenseNo}
              </Link>
              <ExpenseStatusBadge status={expense.status} />
              {expense.receiptUrl ? (
                <span className="bg-primary/10 text-primary inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-medium">
                  <Paperclip className="size-3" />
                  Receipt
                </span>
              ) : null}
            </div>
            <p className="text-muted-foreground mt-1 text-[13px] leading-5">
              {expense.categoryName} ·{" "}
              {formatColomboDate(new Date(expense.expenseDate), "dd MMM yyyy")}
            </p>
            <p className="text-foreground mt-1 line-clamp-2 text-[14px] leading-5">
              {expense.description}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#041433] text-[10px] font-semibold text-white">
                {initials(expense.paidByName)}
              </span>
              <span className="text-muted-foreground text-[13px]">
                Submitted by {expense.paidByName}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end">
          <p className="font-heading text-[22px] leading-7 font-semibold tracking-tight tabular-nums">
            {formatCurrency(expense.amount)}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="h-9"
              render={<Link href={`/expenses/${expense.id}`} />}
            >
              <Eye className="size-4" />
              View
            </Button>
            <Button
              variant="outline"
              className="h-9"
              onClick={onReject}
              disabled={isApproving}
            >
              <X className="size-4" />
              Reject
            </Button>
            <Button className="h-9" onClick={onApprove} disabled={isApproving}>
              <Check className="size-4" />
              {isApproving ? "Approving…" : "Approve"}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ExpenseApprovalQueue() {
  const router = useRouter();
  const { data, refetch, isLoading } = usePendingExpenses();
  const [rejectExpenseId, setRejectExpenseId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const items = data?.items ?? [];
  const pendingCount = items.length;
  const pendingTotal = items.reduce((sum, expense) => sum + expense.amount, 0);

  const handleApprove = async (expenseId: string) => {
    setActionError(null);
    setApprovingId(expenseId);
    try {
      await postApiData<ExpenseDetail>(
        `/api/expenses/${expenseId}/approve`,
        {},
      );
      await refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to approve");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <PageShell
      title="Approvals"
      description="Review pending bills, then approve or reject them."
      actions={
        <Button
          variant="outline"
          className="h-9"
          render={<Link href="/expenses" />}
        >
          All expenses
        </Button>
      }
    >
      <section className="shadow-elevated relative overflow-hidden rounded-2xl bg-[#041433] bg-[linear-gradient(135deg,#041433_0%,#0a2b58_62%,#0869a8_140%)] px-5 py-5 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(80,178,254,0.28),transparent_52%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#50b2fe] uppercase">
              Expense review
            </p>
            <h2 className="font-heading mt-2 text-[22px] leading-7 font-semibold tracking-tight">
              Approval queue
            </h2>
            <p className="mt-2 text-[14px] leading-5 text-white/70">
              Approve bills that should be reimbursed, or reject them with a
              reason. Approved expenses post to the ledger.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-[120px] rounded-xl border border-white/15 bg-white/10 px-3 py-2.5">
              <p className="text-[11px] font-medium text-white/65">Pending</p>
              <p className="font-heading mt-1 text-[18px] leading-6 font-semibold tabular-nums">
                {isLoading ? "—" : pendingCount}
              </p>
            </div>
            <div className="min-w-[160px] rounded-xl border border-white/15 bg-white/10 px-3 py-2.5">
              <p className="text-[11px] font-medium text-white/65">
                To approve
              </p>
              <p className="font-heading mt-1 text-[18px] leading-6 font-semibold tabular-nums">
                {isLoading ? "—" : formatCurrency(pendingTotal)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {actionError ? (
        <p className="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border px-4 py-3 text-sm">
          {actionError}
        </p>
      ) : null}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border-border bg-card shadow-card rounded-2xl border p-5"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="size-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : pendingCount === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="You're all caught up"
          description="There are no pending expense bills to review. New submissions will appear here."
          actionLabel="View all expenses"
          actionIcon={Eye}
          onAction={() => router.push("/expenses")}
        />
      ) : (
        <div className="space-y-3">
          {items.map((expense) => (
            <QueueCard
              key={expense.id}
              expense={expense}
              isApproving={approvingId === expense.id}
              onApprove={() => void handleApprove(expense.id)}
              onReject={() => setRejectExpenseId(expense.id)}
            />
          ))}
        </div>
      )}

      {rejectExpenseId ? (
        <ExpenseRejectDialog
          expenseId={rejectExpenseId}
          open={Boolean(rejectExpenseId)}
          onOpenChange={(open) => {
            if (!open) setRejectExpenseId(null);
          }}
          onRejected={() => refetch()}
        />
      ) : null}
    </PageShell>
  );
}
