import {
  CalendarCheck,
  FileText,
  MapPinned,
  Receipt,
  UserPlus,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type QuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  iconClassName: string;
};

const quickActions: QuickAction[] = [
  {
    label: "Add Employee",
    href: "/employees/new",
    icon: UserPlus,
    description: "Onboard a new team member",
    iconClassName: "bg-primary/10 text-primary",
  },
  {
    label: "New Invoice",
    href: "/invoices/new",
    icon: FileText,
    description: "Create a client invoice",
    iconClassName: "bg-primary/10 text-primary",
  },
  {
    label: "Record Expense",
    href: "/expenses/new",
    icon: Receipt,
    description: "Log a business expense",
    iconClassName:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  },
  {
    label: "Run Payroll",
    href: "/payroll",
    icon: Wallet,
    description: "Process monthly payroll",
    iconClassName:
      "bg-jk-navy-mid/10 text-jk-navy-mid dark:bg-white/10 dark:text-white",
  },
  {
    label: "QR Check-in",
    href: "/attendance/check-in/qr",
    icon: CalendarCheck,
    description: "Record today's attendance",
    iconClassName:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  {
    label: "New Deployment",
    href: "/deployment",
    icon: MapPinned,
    description: "Place staff at a client site",
    iconClassName: "bg-primary/10 text-primary",
  },
];

export function QuickActions() {
  return (
    <Card className="h-full gap-0 py-0">
      <CardHeader className="border-border/60 border-b px-5 pt-5 pb-3">
        <CardTitle className="font-heading text-[15px] leading-5 font-semibold">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 px-5 py-4">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group border-border bg-card hover:border-primary/40 hover:bg-muted/40 focus-visible:ring-primary/40 flex min-h-[52px] items-center gap-3 rounded-xl border px-3 py-2 transition-colors outline-none focus-visible:ring-2"
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  action.iconClassName,
                )}
              >
                <Icon className="size-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-foreground truncate text-[13px] leading-4 font-medium">
                  {action.label}
                </p>
                <p className="text-muted-foreground mt-0.5 truncate text-[12px] leading-4">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
