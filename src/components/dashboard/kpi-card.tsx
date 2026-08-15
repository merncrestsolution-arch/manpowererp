import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKpiValue } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { KpiFormat, TrendDirection } from "@/types/dashboard";
import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  label: string;
  value: number;
  trend: number;
  trendDirection: TrendDirection;
  format?: KpiFormat;
  currency?: string;
  icon: LucideIcon;
  iconClassName?: string;
  isLoading?: boolean;
};

function TrendIndicator({
  trend,
  direction,
}: {
  trend: number;
  direction: TrendDirection;
}) {
  const Icon =
    direction === "up"
      ? TrendingUp
      : direction === "down"
        ? TrendingDown
        : Minus;

  const colorClass =
    direction === "up"
      ? "text-jk-secondary"
      : direction === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[12px] leading-4 font-medium tabular-nums",
        colorClass,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {Math.abs(trend).toFixed(1)}%
    </span>
  );
}

export function KpiCard({
  label,
  value,
  trend,
  trendDirection,
  format = "number",
  currency = "LKR",
  icon: Icon,
  iconClassName,
  isLoading = false,
}: KpiCardProps) {
  if (isLoading) {
    return (
      <Card className="h-full gap-0 py-0">
        <CardContent className="flex h-full min-h-[132px] flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-9 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-20" />
          <Skeleton className="mt-auto h-4 w-28" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border h-full gap-0 py-0">
      <CardContent className="flex h-full min-h-[132px] flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-muted-foreground pt-1 text-[13px] leading-4 font-medium">
            {label}
          </p>
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              iconClassName ?? "bg-primary/10 text-primary",
            )}
          >
            <Icon className="size-4" aria-hidden />
          </div>
        </div>
        <p className="font-heading text-foreground mt-3 truncate text-[24px] leading-7 font-semibold tracking-tight tabular-nums">
          {formatKpiValue(value, format, currency)}
        </p>
        <div className="mt-auto flex items-center gap-1.5 pt-3">
          <TrendIndicator trend={trend} direction={trendDirection} />
          <span className="text-muted-foreground text-[12px] leading-4">
            vs last month
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
