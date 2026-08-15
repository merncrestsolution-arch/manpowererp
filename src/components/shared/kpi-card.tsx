"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  changePeriod?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badgeText?: string;
  badgeVariant?: "emerald" | "amber" | "rose" | "blue" | "gray";
  description?: string;
  isLoading?: boolean;
  className?: string;
}

const badgeVariantStyles = {
  emerald:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  amber:
    "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  rose: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  blue: "bg-primary/10 text-primary border-primary/25",
  gray: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
};

export function KpiCard({
  title,
  value,
  change,
  changePeriod = "vs last month",
  icon: Icon,
  badgeText,
  badgeVariant = "blue",
  description,
  isLoading = false,
  className,
}: KpiCardProps) {
  if (isLoading) {
    return (
      <Card
        className={cn(
          "border-border/80 bg-card p-4 shadow-sm md:p-6",
          className,
        )}
      >
        <CardContent className="space-y-3 p-0">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    );
  }

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <Card
      className={cn(
        "border-border/80 bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md md:p-6",
        className,
      )}
    >
      <CardContent className="flex h-full flex-col justify-between p-0">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-muted-foreground truncate text-xs font-medium md:text-sm">
              {title}
            </span>
            {Icon && (
              <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2">
                <Icon className="h-4 w-4 md:h-5 md:w-5" />
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-heading text-foreground text-xl font-bold tracking-tight md:text-2xl lg:text-3xl">
              {value}
            </span>
          </div>
        </div>

        <div className="border-border/40 mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-2">
          {change !== undefined && (
            <div className="flex items-center gap-1 text-xs font-medium">
              {isPositive && (
                <span className="inline-flex items-center font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="mr-0.5 h-3.5 w-3.5" />+{change}%
                </span>
              )}
              {isNegative && (
                <span className="inline-flex items-center font-semibold text-rose-600 dark:text-rose-400">
                  <TrendingDown className="mr-0.5 h-3.5 w-3.5" />
                  {change}%
                </span>
              )}
              {!isPositive && !isNegative && (
                <span className="text-muted-foreground inline-flex items-center">
                  <Minus className="mr-0.5 h-3.5 w-3.5" />
                  0%
                </span>
              )}
              <span className="text-muted-foreground text-[11px]">
                {changePeriod}
              </span>
            </div>
          )}

          {badgeText && (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors",
                badgeVariantStyles[badgeVariant],
              )}
            >
              {badgeText}
            </span>
          )}

          {description && !change && !badgeText && (
            <span className="text-muted-foreground text-xs">{description}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
