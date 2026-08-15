"use client";

import { Menu } from "lucide-react";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { useUiStore } from "@/store/ui-store";

import type { Role } from "@/types/auth";

type HeaderProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  role: Role;
};

export function Header({ user, role }: HeaderProps) {
  const { setMobileNavOpen } = useUiStore();
  const breadcrumbs = useBreadcrumbs();
  const showBreadcrumbs = breadcrumbs.length > 1;

  return (
    <>
      <header className="border-border bg-card sticky top-0 z-30 shrink-0 border-b">
        <div className="h-header-height max-w-container mx-auto flex w-full items-center justify-between gap-4 px-6 lg:px-10">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 md:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </Button>

            {showBreadcrumbs ? (
              <Breadcrumbs className="hidden min-w-0 sm:flex" />
            ) : null}
          </div>

          <div className="flex h-9 shrink-0 items-center gap-1">
            <NotificationsDropdown />
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </div>
      </header>
      <MobileNav role={role} />
    </>
  );
}
