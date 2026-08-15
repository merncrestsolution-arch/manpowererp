import Link from "next/link";

import type { LucideIcon } from "lucide-react";

type ModuleCardProps = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export function ModuleCard({
  title,
  description,
  href,
  icon: Icon,
}: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="border-border bg-card shadow-card hover:border-primary/35 hover:bg-muted/20 focus-visible:ring-primary/40 flex min-h-[148px] flex-col gap-4 rounded-2xl border p-5 transition-colors outline-none focus-visible:ring-2"
    >
      <span className="jk-icon-well">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="mt-auto min-w-0">
        <h2 className="font-heading text-foreground text-[16px] leading-6 font-semibold">
          {title}
        </h2>
        <p className="text-muted-foreground mt-1 text-[13px] leading-5">
          {description}
        </p>
      </div>
    </Link>
  );
}
