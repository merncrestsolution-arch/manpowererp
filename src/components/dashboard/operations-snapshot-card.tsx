import { AlertCircle, ArrowRight, MapPinned, Receipt } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";

import type { OperationsSnapshot } from "@/types/dashboard";

type OperationsSnapshotCardProps = {
  operations?: OperationsSnapshot;
  isLoading?: boolean;
};

export function OperationsSnapshotCard({
  operations,
  isLoading = false,
}: OperationsSnapshotCardProps) {
  if (isLoading) {
    return (
      <Card className="gap-0 py-0">
        <CardHeader className="px-5 pt-5 pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-3">
          <Skeleton className="h-[108px] rounded-xl" />
          <Skeleton className="h-[108px] rounded-xl" />
          <Skeleton className="h-[108px] rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const items = [
    {
      label: "Active deployments",
      value: String(operations?.activeDeployments ?? 0),
      href: "/deployment",
      icon: MapPinned,
      iconClassName: "bg-primary/10 text-primary",
    },
    {
      label: "Outstanding invoices",
      value: formatCurrency(operations?.outstandingInvoices ?? 0),
      href: "/invoices",
      icon: AlertCircle,
      iconClassName:
        "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    },
    {
      label: "Pending expenses",
      value: String(operations?.pendingExpenses ?? 0),
      href: "/expenses",
      icon: Receipt,
      iconClassName:
        "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
    },
  ];

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-border/60 flex flex-row items-center justify-between gap-3 border-b px-5 pt-5 pb-3">
        <CardTitle className="font-heading text-[15px] leading-5 font-semibold">
          Needs attention
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 shrink-0"
          render={<Link href="/reports" />}
        >
          View reports
          <ArrowRight className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="border-border bg-muted/30 hover:border-primary/30 hover:bg-muted/50 focus-visible:ring-primary/40 flex min-h-[108px] min-w-0 flex-col rounded-xl border p-4 transition-colors outline-none focus-visible:ring-2"
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-lg ${item.iconClassName}`}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <p className="font-heading text-foreground mt-3 truncate text-[20px] leading-7 font-semibold tracking-tight tabular-nums">
                  {item.value}
                </p>
                <p className="text-muted-foreground mt-auto pt-1 text-[12px] leading-4">
                  {item.label}
                </p>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
