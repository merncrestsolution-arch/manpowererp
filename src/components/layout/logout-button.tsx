"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={() => void signOut({ callbackUrl: "/login" })}
      aria-label="Log out"
    >
      <LogOut className="size-4" />
      <span className="hidden sm:inline">Log out</span>
    </Button>
  );
}
