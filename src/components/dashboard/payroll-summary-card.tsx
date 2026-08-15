import { ArrowRight, Clock, Wallet } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";

import type { PayrollSummary } from "@/types/dashboard";

type PayrollSummaryCardProps = {
  summary?: PayrollSummary;
  isLoading?: boolean;
};

export function PayrollSummaryCard({
  summary,
  isLoading = false,
}: PayrollSummaryCardProps) {
  if (isLoading) {
    return (
      <Card className="h-full gap-0 py-0">
        <CardHeader className="border-border/60 border-b px-5 pt-5 pb-3">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3 px-5 pt-4 pb-5">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  const currency = summary?.currency ?? "LKR";
  const totalAmount = summary?.totalAmount ?? 0;
  const pendingApprovals = summary?.pendingApprovals ?? 0;
  const periodLabel = summary?.currentPeriodLabel ?? "Current period";

  return (
    <Card className="h-full gap-0 py-0">
      <CardHeader className="border-border/60 flex flex-row items-center justify-between gap-3 border-b px-5 pt-5 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="jk-icon-well">
            <Wallet className="size-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <CardTitle className="font-heading text-[15px] leading-5 font-semibold">
              Payroll Summary
            </CardTitle>
            <p className="text-muted-foreground mt-0.5 text-[12px] leading-4">
              {periodLabel}
            </p>
          </div>
        </div>
        {pendingApprovals > 0 ? (
          <Badge variant="outline" className="shrink-0">
            {pendingApprovals} pending
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 px-5 pt-4 pb-5">
        <div>
          <p className="text-muted-foreground text-[12px] leading-4">
            Total payroll
          </p>
          <p className="font-heading text-foreground mt-1 text-[26px] leading-8 font-semibold tracking-tight tabular-nums">
            {formatCurrency(totalAmount, currency)}
          </p>
        </div>
        <div className="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Clock className="text-muted-foreground size-4" aria-hidden />
            <span className="text-muted-foreground text-[13px] leading-4">
              Pending approvals
            </span>
          </div>
          <span className="font-heading text-foreground text-[15px] leading-5 font-semibold tabular-nums">
            {pendingApprovals}
          </span>
        </div>
        {totalAmount === 0 && pendingApprovals === 0 ? (
          <p className="text-muted-foreground text-[13px] leading-5">
            No payroll runs for this period yet.
          </p>
        ) : null}
        <Button
          variant="outline"
          className="mt-auto h-9 w-full"
          render={<Link href="/payroll" />}
        >
          Open payroll
          <ArrowRight className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
