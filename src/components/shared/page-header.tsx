import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

type PageHeaderProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  if (!title && !description && !actions) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      {(title || description) && (
        <div className="min-w-0">
          {title ? (
            <h1 className="font-heading text-foreground text-[24px] leading-8 font-semibold tracking-tight">
              {title}
            </h1>
          ) : null}
          {description ? (
            <p className="text-muted-foreground mt-1 max-w-2xl text-[14px] leading-5">
              {description}
            </p>
          ) : null}
        </div>
      )}
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
