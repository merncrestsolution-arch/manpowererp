"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { routeLabels } from "@/config/nav-config";

import type { BreadcrumbItem } from "@/types/navigation";

function formatSegmentLabel(segment: string): string {
  if (routeLabels[segment]) {
    return routeLabels[segment];
  }

  if (/^[a-z0-9-]+$/i.test(segment) && segment.length > 12) {
    return "Details";
  }

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();

  return useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0) {
      return [{ label: "Dashboard", href: "/dashboard" }];
    }

    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      const isLast = index === segments.length - 1;

      return {
        label: formatSegmentLabel(segment),
        href: isLast ? undefined : href,
      };
    });
  }, [pathname]);
}
