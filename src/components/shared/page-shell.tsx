import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function PageShell({
  title,
  description,
  actions,
  children,
  className,
}: PageShellProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <header className="grid gap-x-4 gap-y-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <h1 className="font-heading text-foreground text-[24px] leading-8 font-semibold tracking-tight">
            {title}
          </h1>
          {description ? (
            <p className="text-muted-foreground mt-1 max-w-2xl text-[14px] leading-5">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {actions}
          </div>
        ) : null}
      </header>
      {children}
    </div>
  );
}
