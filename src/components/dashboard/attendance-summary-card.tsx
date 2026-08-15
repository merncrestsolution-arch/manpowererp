import {
  ArrowRight,
  Minus,
  TrendingDown,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { AttendanceSummary, TrendDirection } from "@/types/dashboard";

type AttendanceSummaryCardProps = {
  summary?: AttendanceSummary;
  isLoading?: boolean;
};

function AttendanceStat({
  label,
  value,
  accentClass,
}: {
  label: string;
  value: number;
  accentClass: string;
}) {
  return (
    <div className="bg-muted/40 flex min-h-[76px] flex-col items-center justify-center rounded-lg px-2 py-3 text-center">
      <p
        className={cn(
          "font-heading text-[22px] leading-7 font-semibold tabular-nums",
          accentClass,
        )}
      >
        {value}
      </p>
      <p className="text-muted-foreground mt-1 text-[12px] leading-4">
        {label}
      </p>
    </div>
  );
}

function TrendBadge({
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
        "inline-flex shrink-0 items-center gap-1 text-[12px] leading-4 font-medium",
        colorClass,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {Math.abs(trend).toFixed(1)}% vs yesterday
    </span>
  );
}

export function AttendanceSummaryCard({
  summary,
  isLoading = false,
}: AttendanceSummaryCardProps) {
  if (isLoading) {
    return (
      <Card className="h-full gap-0 py-0">
        <CardHeader className="border-border/60 border-b px-5 pt-5 pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="px-5 pt-4 pb-5">
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-[76px] rounded-lg" />
            <Skeleton className="h-[76px] rounded-lg" />
            <Skeleton className="h-[76px] rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const present = summary?.present ?? 0;
  const absent = summary?.absent ?? 0;
  const late = summary?.late ?? 0;
  const trend = summary?.trend ?? 0;
  const trendDirection = summary?.trendDirection ?? "neutral";
  const isEmpty = present === 0 && absent === 0 && late === 0;

  return (
    <Card className="h-full gap-0 py-0">
      <CardHeader className="border-border/60 flex flex-row items-center justify-between gap-3 border-b px-5 pt-5 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
            <UserCheck className="size-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <CardTitle className="font-heading text-[15px] leading-5 font-semibold">
              Today&apos;s Attendance
            </CardTitle>
            <p className="text-muted-foreground mt-0.5 text-[12px] leading-4">
              Live workforce status
            </p>
          </div>
        </div>
        <TrendBadge trend={trend} direction={trendDirection} />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 px-5 pt-4 pb-5">
        <div className="grid grid-cols-3 gap-2">
          <AttendanceStat
            label="Present"
            value={present}
            accentClass="text-jk-secondary"
          />
          <AttendanceStat
            label="Absent"
            value={absent}
            accentClass="text-destructive"
          />
          <AttendanceStat
            label="Late"
            value={late}
            accentClass="text-jk-tertiary"
          />
        </div>
        {isEmpty ? (
          <p className="text-muted-foreground text-[13px] leading-5">
            No attendance records for today yet.
          </p>
        ) : null}
        <Button
          variant="outline"
          className="mt-auto h-9 w-full"
          render={<Link href="/attendance" />}
        >
          Open attendance
          <ArrowRight className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
