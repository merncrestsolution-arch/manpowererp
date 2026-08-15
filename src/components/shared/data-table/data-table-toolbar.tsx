import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

type DataTableToolbarProps = {
  children: ReactNode;
  className?: string;
};

export function DataTableToolbar({
  children,
  className,
}: DataTableToolbarProps) {
  return (
    <div
      className={cn(
        "border-border bg-card shadow-card flex flex-wrap items-center gap-2 rounded-2xl border px-4 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
