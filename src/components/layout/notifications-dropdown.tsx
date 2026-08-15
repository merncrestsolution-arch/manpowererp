"use client";

import { Bell, CheckCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

export function NotificationsDropdown() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative size-9"
            aria-label="Notifications"
          />
        }
      >
        <Bell className="size-[18px]" />
        {unreadCount > 0 ? (
          <span className="bg-destructive absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="shadow-modal w-80 p-0">
        <div className="border-border px-jk-md py-jk-sm flex items-center justify-between border-b">
          <DropdownMenuLabel className="text-title-lg p-0 font-semibold">
            Notifications
          </DropdownMenuLabel>
          <Button
            variant="ghost"
            size="sm"
            className="text-label-md h-7 gap-1 px-2"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        </div>

        {notifications.length === 0 ? (
          <div className="gap-jk-sm px-jk-md py-jk-xl flex flex-col items-center justify-center text-center">
            <span className="bg-muted flex size-10 items-center justify-center rounded-full">
              <Bell className="text-muted-foreground size-4" />
            </span>
            <p className="text-body-md text-foreground font-medium">
              You&apos;re all caught up
            </p>
            <p className="text-body-md text-muted-foreground">
              New alerts about payroll, attendance, and approvals will appear
              here.
            </p>
          </div>
        ) : (
          <div className="py-jk-xs max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "px-jk-md py-jk-sm flex flex-col items-start gap-0.5 rounded-none",
                  !notification.read && "bg-accent/50",
                )}
              >
                <span className="text-body-md font-medium">
                  {notification.title}
                </span>
                <span className="text-body-md text-muted-foreground">
                  {notification.description}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
