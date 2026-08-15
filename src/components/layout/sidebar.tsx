"use client";

import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { SidebarNavItem } from "@/components/layout/sidebar-nav-item";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { filterNavGroupsByRole, navGroups } from "@/config/nav-config";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

import type { Role } from "@/types/auth";

type SidebarProps = {
  role: Role;
};

export function Sidebar({ role }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const visibleGroups = filterNavGroupsByRole(navGroups, role);

  return (
    <aside
      className={cn(
        "border-sidebar-border hidden h-screen shrink-0 flex-col overflow-hidden border-r bg-[#041433] bg-[linear-gradient(180deg,#041433_0%,#062048_100%)] transition-[width] duration-200 ease-in-out md:sticky md:top-0 md:flex",
        sidebarCollapsed ? "w-sidebar-collapsed" : "w-sidebar",
      )}
    >
      <div
        className={cn(
          "h-header-height border-sidebar-border flex shrink-0 items-center border-b",
          sidebarCollapsed ? "justify-center px-2" : "px-4",
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            "text-sidebar-foreground focus-visible:ring-sidebar-ring flex min-w-0 items-center gap-3 outline-none focus-visible:ring-2",
            sidebarCollapsed && "justify-center",
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
            <BrandLogo variant="mark" className="h-[22px] w-auto" />
          </span>
          {!sidebarCollapsed ? (
            <span className="truncate text-[15px] leading-none font-semibold tracking-tight">
              JK Manpower
            </span>
          ) : null}
        </Link>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <nav className="flex flex-col gap-3 px-3 py-3">
          {visibleGroups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              {!sidebarCollapsed ? (
                <p className="px-3 pb-1 text-[10px] font-semibold tracking-[0.14em] text-white/40 uppercase">
                  {group.label}
                </p>
              ) : (
                <Separator className="my-1 bg-white/10" />
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    collapsed={sidebarCollapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-sidebar-border shrink-0 space-y-1 border-t p-3">
        <Button
          variant="ghost"
          size={sidebarCollapsed ? "icon" : "default"}
          className={cn(
            "h-9 w-full text-white/70 hover:bg-white/10 hover:text-white",
            !sidebarCollapsed && "justify-start px-3",
            sidebarCollapsed && "size-9",
          )}
          onClick={() => void signOut({ callbackUrl: "/login" })}
          aria-label="Log out"
        >
          <LogOut className="size-4" />
          {!sidebarCollapsed ? (
            <span className="whitespace-nowrap">Log out</span>
          ) : null}
        </Button>
        <Button
          variant="ghost"
          size={sidebarCollapsed ? "icon" : "default"}
          className={cn(
            "h-9 w-full text-white/70 hover:bg-white/10 hover:text-white",
            !sidebarCollapsed && "justify-start px-3",
            sidebarCollapsed && "size-9",
          )}
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <>
              <PanelLeftClose className="size-4" />
              <span className="whitespace-nowrap">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
