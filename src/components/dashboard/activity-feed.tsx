"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CalendarCheck,
  Clock,
  CreditCard,
  FileText,
  Megaphone,
  Receipt,
  UserPlus,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toColomboTime } from "@/lib/date";
import { cn } from "@/lib/utils";

import type { ActivityItem, ActivityType } from "@/types/dashboard";
import type { LucideIcon } from "lucide-react";

type ActivityFeedProps = {
  activities: ActivityItem[];
  isLoading?: boolean;
  className?: string;
};

const activityIconMap: Record<ActivityType, LucideIcon> = {
  payment: CreditCard,
  leave: CalendarCheck,
  announcement: Megaphone,
  employee: UserPlus,
  invoice: FileText,
  expense: Receipt,
  attendance: Clock,
  general: Bell,
};

const activityColorMap: Record<ActivityType, string> = {
  payment:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  leave: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  announcement: "bg-primary/10 text-primary",
  employee:
    "bg-jk-navy-mid/10 text-jk-navy-mid dark:bg-white/10 dark:text-white",
  invoice: "bg-primary/10 text-primary",
  expense: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  attendance:
    "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
  general: "bg-muted text-muted-foreground",
};

function formatRelativeTimestamp(timestamp: string): string {
  return formatDistanceToNow(toColomboTime(new Date(timestamp)), {
    addSuffix: true,
  });
}

function ActivityFeedItem({ activity }: { activity: ActivityItem }) {
  const Icon = activityIconMap[activity.type];
  const colorClass = activityColorMap[activity.type];
  const initials = activity.actorName
    ? activity.actorName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : activity.title.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-start gap-3 py-3">
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarFallback className={cn("text-xs", colorClass)}>
          {activity.actorName ? (
            initials
          ) : (
            <Icon className="size-3.5" aria-hidden />
          )}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-heading text-foreground truncate text-[13px] leading-5 font-medium">
            {activity.title}
          </p>
          <time
            className="text-muted-foreground shrink-0 text-[12px] leading-4"
            dateTime={activity.timestamp}
          >
            {formatRelativeTimestamp(activity.timestamp)}
          </time>
        </div>
        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-[13px] leading-5">
          {activity.description}
        </p>
      </div>
    </div>
  );
}

function ActivityFeedSkeleton() {
  return (
    <div className="divide-border/70 divide-y">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex gap-3 py-3">
          <Skeleton className="size-6 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityFeedEmptyState() {
  return (
    <div className="border-border bg-muted/30 flex h-full min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed px-5 text-center">
      <div className="bg-muted flex size-12 items-center justify-center rounded-full">
        <Bell className="text-muted-foreground size-5" aria-hidden />
      </div>
      <p className="font-heading text-foreground mt-3 text-[13px] font-medium">
        No recent activity
      </p>
      <p className="text-muted-foreground mt-1 max-w-xs text-[13px] leading-5">
        System events and updates will appear here as your team starts using the
        platform.
      </p>
    </div>
  );
}

export function ActivityFeed({
  activities,
  isLoading = false,
  className,
}: ActivityFeedProps) {
  return (
    <Card className={cn("h-full gap-0 py-0", className)}>
      <CardHeader className="border-border/60 border-b px-5 pt-5 pb-3">
        <CardTitle className="font-heading text-[15px] leading-5 font-semibold">
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 px-5 py-1">
        {isLoading ? (
          <ActivityFeedSkeleton />
        ) : activities.length === 0 ? (
          <ActivityFeedEmptyState />
        ) : (
          <div className="divide-border/70 divide-y">
            {activities.map((activity) => (
              <ActivityFeedItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
