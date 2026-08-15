"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export type HubNavItem = {
  label: string;
  href: string;
};

type HubNavProps = {
  items: HubNavItem[];
  className?: string;
};

export function HubNav({ items, className }: HubNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "border-border bg-card shadow-card flex w-full flex-wrap gap-1 rounded-2xl border p-1.5",
        className,
      )}
    >
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex h-8 items-center rounded-lg px-3 text-[13px] font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
