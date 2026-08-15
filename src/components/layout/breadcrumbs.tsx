"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { cn } from "@/lib/utils";

type BreadcrumbsProps = {
  className?: string;
};

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const items = useBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="gap-jk-xs flex flex-wrap items-center">
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? (
              <li aria-hidden="true">
                <ChevronRight className="text-muted-foreground size-3.5" />
              </li>
            ) : null}
            <li>
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-body-md text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-body-md text-foreground font-medium">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
