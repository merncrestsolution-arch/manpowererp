import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

type SectionCardProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "border-border bg-card shadow-card rounded-2xl border p-5",
        className,
      )}
    >
      {title || actions ? (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? (
              <h2 className="font-heading text-foreground text-[16px] leading-6 font-semibold">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-muted-foreground mt-1 text-[13px] leading-5">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
