"use client";

import { TooltipProvider } from "@/components/ui/tooltip";

import { Header } from "./header";
import { Sidebar } from "./sidebar";

import type { Role } from "@/types/auth";

type DashboardShellProps = {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  role: Role;
};

export function DashboardShell({ children, user, role }: DashboardShellProps) {
  return (
    <TooltipProvider delay={0}>
      <div className="bg-background flex min-h-screen">
        <Sidebar role={role} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header user={user} role={role} />
          <main className="bg-background min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
            <div className="max-w-container mx-auto w-full px-6 py-6 lg:px-10 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
