import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

type ChartContainerProps = {
  title: string;
  description?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  legend?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function ChartContainer({
  title,
  description,
  isLoading = false,
  isEmpty = false,
  emptyTitle = "No data available",
  emptyDescription = "Data will appear here once records are added.",
  legend,
  action,
  className,
  children,
}: ChartContainerProps) {
  return (
    <Card className={cn("h-full gap-0 py-0", className)}>
      <CardHeader className="border-border/60 flex flex-row items-center justify-between gap-3 border-b px-5 pt-5 pb-3">
        <div className="min-w-0 flex-1">
          <CardTitle className="font-heading text-foreground text-[15px] leading-5 font-semibold">
            {title}
          </CardTitle>
          {description ? (
            <p className="text-muted-foreground mt-0.5 truncate text-[12px] leading-4">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col px-5 pt-4 pb-5">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[240px] w-full rounded-lg" />
            <div className="flex gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ) : isEmpty ? (
          <div className="border-border bg-muted/30 flex h-[240px] flex-col items-center justify-center rounded-lg border border-dashed px-5 text-center">
            <p className="font-heading text-foreground text-[13px] font-medium">
              {emptyTitle}
            </p>
            <p className="text-muted-foreground mt-1 max-w-xs text-[13px] leading-5">
              {emptyDescription}
            </p>
          </div>
        ) : (
          <>
            {children}
            {legend ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {legend}
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
