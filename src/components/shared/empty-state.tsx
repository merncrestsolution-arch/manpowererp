"use client";

import { FolderOpen, Plus } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ComponentType<{ className?: string }>;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon = Plus,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-border bg-card shadow-card flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed px-8 py-12 text-center",
        className,
      )}
    >
      <div className="bg-primary/10 text-primary mb-4 flex size-12 shrink-0 items-center justify-center rounded-xl">
        <Icon className="size-5" />
      </div>

      <h3 className="font-heading text-foreground mb-1 text-lg font-semibold">
        {title}
      </h3>

      <p className="text-muted-foreground mt-1 max-w-md text-sm leading-relaxed">
        {description}
      </p>

      {actionLabel || secondaryActionLabel ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {secondaryActionLabel && onSecondaryAction ? (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          ) : null}

          {actionLabel && onAction ? (
            <Button onClick={onAction} className="gap-2">
              <ActionIcon className="h-4 w-4" />
              {actionLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
