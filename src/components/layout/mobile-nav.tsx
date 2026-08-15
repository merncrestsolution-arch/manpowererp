"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { SidebarNavItem } from "@/components/layout/sidebar-nav-item";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { filterNavGroupsByRole, navGroups } from "@/config/nav-config";
import { useUiStore } from "@/store/ui-store";

import type { Role } from "@/types/auth";

type MobileNavProps = {
  role: Role;
};

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const { mobileNavOpen, setMobileNavOpen } = useUiStore();
  const visibleGroups = filterNavGroupsByRole(navGroups, role);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, setMobileNavOpen]);

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent
        side="left"
        showCloseButton
        className="w-sidebar bg-sidebar flex max-w-[85vw] flex-col gap-0 p-0"
      >
        <SheetHeader className="h-header-height border-sidebar-border px-jk-md justify-center border-b py-0">
          <SheetTitle className="gap-jk-sm text-title-lg text-sidebar-foreground flex items-center">
            <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
              <BrandLogo variant="mark" className="h-7 w-7" />
            </span>
            <Link href="/dashboard" onClick={() => setMobileNavOpen(false)}>
              JK Manpower
            </Link>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="px-jk-sm py-jk-md min-h-0 flex-1">
          <nav className="gap-jk-lg flex flex-col">
            {visibleGroups.map((group) => (
              <div key={group.label} className="gap-jk-xs flex flex-col">
                <p className="px-jk-sm text-[11px] font-semibold tracking-[0.16em] text-white/45 uppercase">
                  {group.label}
                </p>
                <div className="gap-jk-xs flex flex-col">
                  {group.items.map((item) => (
                    <SidebarNavItem
                      key={item.href}
                      item={item}
                      onNavigate={() => setMobileNavOpen(false)}
                    />
                  ))}
                </div>
                <Separator className="mt-jk-sm last:hidden" />
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div className="border-sidebar-border p-jk-sm border-t">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-destructive w-full justify-start"
            onClick={() => void signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="size-4" />
            Log out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
