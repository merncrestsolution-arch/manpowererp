import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { InvoiceStatus, QuotationStatus } from "@prisma/client";

const invoiceStatusConfig: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  SENT: {
    label: "Sent",
    className: "bg-jk-primary-container/30 text-jk-primary",
  },
  PARTIALLY_PAID: {
    label: "Partially Paid",
    className:
      "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  PAID: {
    label: "Paid",
    className: "bg-jk-secondary-container/30 text-jk-secondary",
  },
  OVERDUE: {
    label: "Overdue",
    className: "bg-destructive/10 text-destructive",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground line-through",
  },
};

const quotationStatusConfig: Record<
  QuotationStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  SENT: {
    label: "Sent",
    className: "bg-jk-primary-container/30 text-jk-primary",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-jk-secondary-container/30 text-jk-secondary",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-muted text-muted-foreground",
  },
  CONVERTED: {
    label: "Converted",
    className: "bg-jk-secondary-container/30 text-jk-secondary",
  },
};

type InvoiceStatusBadgeProps = {
  status: InvoiceStatus;
  className?: string;
};

type QuotationStatusBadgeProps = {
  status: QuotationStatus;
  className?: string;
};

export function InvoiceStatusBadge({
  status,
  className,
}: InvoiceStatusBadgeProps) {
  const config = invoiceStatusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

export function QuotationStatusBadge({
  status,
  className,
}: QuotationStatusBadgeProps) {
  const config = quotationStatusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
