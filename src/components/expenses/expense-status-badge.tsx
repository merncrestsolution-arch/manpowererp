import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { ExpenseStatus } from "@prisma/client";

const statusConfig: Record<
  ExpenseStatus,
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
  PAID: {
    label: "Paid",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
};

export function ExpenseStatusBadge({ status }: { status: ExpenseStatus }) {
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
