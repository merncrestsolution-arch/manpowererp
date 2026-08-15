"use client";

import { ExpenseStatusBadge } from "@/components/expenses/expense-status-badge";
import { formatColomboDate } from "@/lib/date";

import type { ExpenseApprovalHistoryItem } from "@/types/expense";

type ExpenseApprovalHistoryProps = {
  history: ExpenseApprovalHistoryItem[];
};

export function ExpenseApprovalHistory({
  history,
}: ExpenseApprovalHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="p-jk-lg text-muted-foreground rounded-lg border border-dashed text-center">
        No approval history recorded.
      </div>
    );
  }

  return (
    <div className="space-y-jk-sm">
      {history.map((entry) => (
        <div
          key={entry.id}
          className="bg-card px-jk-md py-jk-sm rounded-lg border"
        >
          <div className="flex flex-wrap items-center gap-2">
            {entry.fromStatus ? (
              <ExpenseStatusBadge status={entry.fromStatus} />
            ) : (
              <span className="text-label-md text-muted-foreground">—</span>
            )}
            <span className="text-muted-foreground">→</span>
            <ExpenseStatusBadge status={entry.toStatus} />
          </div>
          <p className="text-body-md text-muted-foreground mt-1">
            {formatColomboDate(new Date(entry.changedAt))} ·{" "}
            {entry.changedByName}
          </p>
          {entry.remarks ? (
            <p className="text-body-md mt-1">{entry.remarks}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
