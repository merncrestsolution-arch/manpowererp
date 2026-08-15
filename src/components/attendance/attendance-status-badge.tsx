import { Badge } from "@/components/ui/badge";

import type { AttendanceStatus } from "@prisma/client";

const statusConfig: Record<
  AttendanceStatus | "NOT_RECORDED",
  { label: string; className: string }
> = {
  PRESENT: {
    label: "Present",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  LATE: {
    label: "Late",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  ABSENT: {
    label: "Absent",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  HALF_DAY: {
    label: "Half day",
    className: "border-primary/20 bg-primary/10 text-primary",
  },
  ON_LEAVE: {
    label: "On leave",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
  NOT_RECORDED: {
    label: "Not recorded",
    className: "border-border bg-muted text-muted-foreground",
  },
};

type AttendanceStatusBadgeProps = {
  status: AttendanceStatus | "NOT_RECORDED";
};

export function AttendanceStatusBadge({ status }: AttendanceStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
