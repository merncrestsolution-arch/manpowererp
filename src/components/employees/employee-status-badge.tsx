import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { EmployeeStatus, LeaveStatus } from "@prisma/client";

const employeeStatusConfig: Record<
  EmployeeStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Active",
    className: "bg-jk-secondary-container/30 text-jk-secondary",
  },
  ON_LEAVE: {
    label: "On Leave",
    className:
      "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  },
  SUSPENDED: {
    label: "Suspended",
    className:
      "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
  },
  TERMINATED: {
    label: "Terminated",
    className: "bg-destructive/10 text-destructive",
  },
};

const leaveStatusConfig: Record<
  LeaveStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className:
      "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-jk-secondary-container/30 text-jk-secondary",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive",
  },
};

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  const config = employeeStatusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", config.className)}
    >
      {config.label}
    </Badge>
  );
}

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  const config = leaveStatusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", config.className)}
    >
      {config.label}
    </Badge>
  );
}
