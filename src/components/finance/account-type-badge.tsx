import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { ChartAccountType } from "@/types/finance";

const typeConfig: Record<
  ChartAccountType,
  { label: string; className: string }
> = {
  ASSET: {
    label: "Asset",
    className: "bg-primary/10 text-primary",
  },
  LIABILITY: {
    label: "Liability",
    className:
      "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
  },
  EQUITY: {
    label: "Equity",
    className:
      "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  },
  REVENUE: {
    label: "Revenue",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  EXPENSE: {
    label: "Expense",
    className:
      "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  },
};

export function AccountTypeBadge({ type }: { type: ChartAccountType }) {
  const config = typeConfig[type];

  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", config.className)}
    >
      {config.label}
    </Badge>
  );
}
