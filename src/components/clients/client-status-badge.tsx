import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type {
  ClientBillingStatus,
  ClientContractStatus,
  ClientStatus,
  ClientWorkerAssignmentStatus,
} from "@prisma/client";

const clientStatusConfig: Record<
  ClientStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Active",
    className: "bg-jk-secondary-container/30 text-jk-secondary",
  },
  INACTIVE: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground",
  },
  BLACKLISTED: {
    label: "Blacklisted",
    className: "bg-destructive/10 text-destructive",
  },
};

const contractStatusConfig: Record<
  ClientContractStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  ACTIVE: {
    label: "Active",
    className: "bg-jk-secondary-container/30 text-jk-secondary",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-jk-tertiary-container/30 text-jk-tertiary",
  },
  TERMINATED: {
    label: "Terminated",
    className: "bg-destructive/10 text-destructive",
  },
};

const assignmentStatusConfig: Record<
  ClientWorkerAssignmentStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Active",
    className: "bg-jk-secondary-container/30 text-jk-secondary",
  },
  ENDED: {
    label: "Ended",
    className: "bg-muted text-muted-foreground",
  },
};

const billingStatusConfig: Record<
  ClientBillingStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className:
      "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  },
  INVOICED: {
    label: "Invoiced",
    className: "bg-jk-primary-container/15 text-jk-primary-container",
  },
  PAID: {
    label: "Paid",
    className: "bg-jk-secondary-container/30 text-jk-secondary",
  },
};

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  const config = clientStatusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", config.className)}
    >
      {config.label}
    </Badge>
  );
}

export function ContractStatusBadge({
  status,
}: {
  status: ClientContractStatus;
}) {
  const config = contractStatusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", config.className)}
    >
      {config.label}
    </Badge>
  );
}

export function AssignmentStatusBadge({
  status,
}: {
  status: ClientWorkerAssignmentStatus;
}) {
  const config = assignmentStatusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", config.className)}
    >
      {config.label}
    </Badge>
  );
}

export function BillingStatusBadge({
  status,
}: {
  status: ClientBillingStatus;
}) {
  const config = billingStatusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", config.className)}
    >
      {config.label}
    </Badge>
  );
}
