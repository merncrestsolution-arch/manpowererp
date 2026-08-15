"use client";

import React from "react";

import { cn } from "@/lib/utils";

export type StatusBadgeVariant =
  | "active"
  | "inactive"
  | "pending"
  | "approved"
  | "rejected"
  | "paid"
  | "overdue"
  | "draft"
  | "deployed"
  | "available"
  | "on_leave"
  | "terminated"
  | "info";

export interface StatusBadgeProps {
  status: string | StatusBadgeVariant;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}

const statusConfig: Record<
  string,
  { label: string; style: string; dotStyle: string }
> = {
  active: {
    label: "Active",
    style:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    dotStyle: "bg-emerald-500",
  },
  inactive: {
    label: "Inactive",
    style:
      "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
    dotStyle: "bg-slate-400",
  },
  pending: {
    label: "Pending",
    style:
      "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    dotStyle: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    style:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    dotStyle: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    style: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    dotStyle: "bg-rose-500",
  },
  paid: {
    label: "Paid",
    style:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    dotStyle: "bg-emerald-500",
  },
  overdue: {
    label: "Overdue",
    style: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    dotStyle: "bg-rose-500",
  },
  draft: {
    label: "Draft",
    style:
      "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
    dotStyle: "bg-slate-400",
  },
  deployed: {
    label: "Deployed",
    style: "bg-primary/10 text-primary border-primary/25",
    dotStyle: "bg-primary",
  },
  available: {
    label: "Available",
    style:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    dotStyle: "bg-emerald-500",
  },
  on_leave: {
    label: "On Leave",
    style:
      "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    dotStyle: "bg-amber-500",
  },
  terminated: {
    label: "Terminated",
    style: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    dotStyle: "bg-rose-500",
  },
  info: {
    label: "Info",
    style: "bg-primary/10 text-primary border-primary/25",
    dotStyle: "bg-primary",
  },
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export function StatusBadge({
  status,
  label,
  className,
  size = "md",
  showDot = true,
}: StatusBadgeProps) {
  const normalizedKey = String(status).toLowerCase().replace(/[\s-]/g, "_");
  const config = statusConfig[normalizedKey] || {
    label: label || String(status),
    style:
      "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
    dotStyle: "bg-slate-400",
  };

  const displayText = label || config.label;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border font-medium transition-colors",
        config.style,
        sizeStyles[size],
        className,
      )}
    >
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", config.dotStyle)} />
      )}
      <span>{displayText}</span>
    </span>
  );
}
