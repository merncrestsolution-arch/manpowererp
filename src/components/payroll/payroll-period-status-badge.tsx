import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { PayrollPeriodStatus, PayslipStatus } from "@/types/payroll";

const periodStatusConfig: Record<
  PayrollPeriodStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  PROCESSING: {
    label: "Processing",
    className: "bg-jk-primary-container/15 text-jk-primary-container",
  },
  FINALIZED: {
    label: "Finalized",
    className: "bg-jk-secondary-container/30 text-jk-secondary",
  },
  PAID: {
    label: "Paid",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
};

const payslipStatusConfig: Record<
  PayslipStatus,
  { label: string; className: string }
> = {
  DRAFT: periodStatusConfig.DRAFT,
  FINALIZED: periodStatusConfig.FINALIZED,
  PAID: periodStatusConfig.PAID,
};

export function PayrollPeriodStatusBadge({
  status,
}: {
  status: PayrollPeriodStatus;
}) {
  const config = periodStatusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", config.className)}
    >
      {config.label}
    </Badge>
  );
}

export function PayslipStatusBadge({ status }: { status: PayslipStatus }) {
  const config = payslipStatusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", config.className)}
    >
      {config.label}
    </Badge>
  );
}
