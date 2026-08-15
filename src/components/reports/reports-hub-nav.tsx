"use client";

import { HubNav, type HubNavItem } from "@/components/shared/hub-nav";

type ReportsHubNavProps = {
  items: HubNavItem[];
  className?: string;
};

export function ReportsHubNav({ items, className }: ReportsHubNavProps) {
  return <HubNav items={items} className={className} />;
}
