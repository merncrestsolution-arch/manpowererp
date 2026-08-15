import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { DeploymentStatus } from "@prisma/client";

const statusConfig: Record<
  DeploymentStatus,
  { label: string; className: string }
> = {
  SCHEDULED: {
    label: "Scheduled",
    className: "bg-jk-primary-container/15 text-jk-primary-container",
  },
  ACTIVE: {
    label: "Active",
    className: "bg-jk-secondary-container/30 text-jk-secondary",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-muted text-muted-foreground",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-destructive/10 text-destructive",
  },
};

export function DeploymentStatusBadge({
  status,
}: {
  status: DeploymentStatus;
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
