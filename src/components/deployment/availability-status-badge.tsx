import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { EmployeeAvailabilityStatus } from "@/types/deployment";

const statusConfig: Record<
  EmployeeAvailabilityStatus,
  { label: string; className: string }
> = {
  AVAILABLE: {
    label: "Available",
    className: "bg-jk-secondary-container/30 text-jk-secondary",
  },
  DEPLOYED: {
    label: "Deployed",
    className: "bg-jk-primary-container/20 text-jk-primary",
  },
  ON_LEAVE: {
    label: "On Leave",
    className: "bg-amber-500/10 text-amber-700",
  },
};

export const availabilityColumnColors: Record<
  EmployeeAvailabilityStatus,
  string
> = {
  AVAILABLE: "border-t-jk-secondary",
  DEPLOYED: "border-t-jk-primary",
  ON_LEAVE: "border-t-amber-500",
};

export function AvailabilityStatusBadge({
  status,
}: {
  status: EmployeeAvailabilityStatus;
}) {
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
