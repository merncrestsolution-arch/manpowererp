import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { CandidateStatus } from "@prisma/client";

const statusConfig: Record<
  CandidateStatus,
  { label: string; className: string }
> = {
  APPLIED: {
    label: "Applied",
    className: "bg-muted text-muted-foreground",
  },
  SCREENING: {
    label: "Screening",
    className: "bg-jk-primary-container/15 text-jk-primary-container",
  },
  INTERVIEW_SCHEDULED: {
    label: "Interview",
    className: "bg-jk-primary-container/20 text-jk-primary",
  },
  INTERVIEWED: {
    label: "Interviewed",
    className: "bg-jk-primary-container/15 text-jk-primary-container",
  },
  OFFERED: {
    label: "Offered",
    className: "bg-amber-500/10 text-amber-700",
  },
  PLACED: {
    label: "Placed",
    className: "bg-jk-secondary-container/30 text-jk-secondary",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    className: "bg-muted text-muted-foreground",
  },
};

export function CandidateStatusBadge({ status }: { status: CandidateStatus }) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", config.className)}
    >
      {config.label}
    </Badge>
  );
}

export const pipelineColumnColors: Record<CandidateStatus, string> = {
  APPLIED: "border-t-muted-foreground",
  SCREENING: "border-t-jk-primary-container",
  INTERVIEW_SCHEDULED: "border-t-jk-primary",
  INTERVIEWED: "border-t-jk-primary-container",
  OFFERED: "border-t-amber-500",
  PLACED: "border-t-jk-secondary",
  REJECTED: "border-t-destructive",
  WITHDRAWN: "border-t-muted-foreground",
};
