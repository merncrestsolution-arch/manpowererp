"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { NavItem } from "@/types/navigation";

type SidebarNavItemProps = {
  item: NavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function SidebarNavItem({
  item,
  collapsed = false,
  onNavigate,
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group focus-visible:ring-sidebar-ring relative flex h-9 items-center gap-2.5 rounded-lg text-[13px] leading-none font-medium transition-colors duration-150 outline-none focus-visible:ring-2",
        collapsed ? "justify-center px-0" : "px-3",
        isActive
          ? "bg-white/12 text-white"
          : "text-white/70 hover:bg-white/8 hover:text-white",
      )}
    >
      {isActive ? (
        <span className="bg-sidebar-primary absolute top-1/2 left-1.5 h-4 w-0.5 -translate-y-1/2 rounded-full" />
      ) : null}
      <Icon className="size-[18px] shrink-0" aria-hidden="true" />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger className="w-full">{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return link;
}
