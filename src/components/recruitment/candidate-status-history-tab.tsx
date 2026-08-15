"use client";

import { CandidateStatusBadge } from "@/components/recruitment/candidate-status-badge";
import { useCandidateStatusHistory } from "@/hooks/use-recruitment";
import { formatColomboDate } from "@/lib/date";

type CandidateStatusHistoryTabProps = {
  candidateId: string;
};

export function CandidateStatusHistoryTab({
  candidateId,
}: CandidateStatusHistoryTabProps) {
  const { data: history = [], isLoading } =
    useCandidateStatusHistory(candidateId);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading history...</p>;
  }

  return (
    <div className="space-y-jk-sm">
      {history.length === 0 ? (
        <div className="p-jk-lg text-muted-foreground rounded-lg border border-dashed text-center">
          No status changes recorded.
        </div>
      ) : (
        history.map((entry) => (
          <div
            key={entry.id}
            className="bg-card px-jk-md py-jk-sm rounded-lg border"
          >
            <div className="flex flex-wrap items-center gap-2">
              {entry.fromStatus ? (
                <CandidateStatusBadge status={entry.fromStatus} />
              ) : (
                <span className="text-label-md text-muted-foreground">—</span>
              )}
              <span className="text-muted-foreground">→</span>
              <CandidateStatusBadge status={entry.toStatus} />
            </div>
            <p className="text-body-md text-muted-foreground mt-1">
              {formatColomboDate(new Date(entry.changedAt))} · {entry.changedBy}
            </p>
            {entry.remarks ? (
              <p className="text-body-md mt-1">{entry.remarks}</p>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
}
