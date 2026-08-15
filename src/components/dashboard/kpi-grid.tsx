import {
  Briefcase,
  Building2,
  CalendarClock,
  DollarSign,
  Receipt,
  Users,
} from "lucide-react";
import Link from "next/link";

import { KpiCard } from "./kpi-card";

import type { DashboardKpis } from "@/types/dashboard";

type KpiGridProps = {
  kpis?: DashboardKpis;
  isLoading?: boolean;
};

const kpiConfig = [
  {
    key: "totalEmployees" as const,
    href: "/employees",
    icon: Users,
    iconClassName: "bg-primary/10 text-primary",
  },
  {
    key: "activeClients" as const,
    href: "/clients",
    icon: Building2,
    iconClassName:
      "bg-jk-navy-mid/10 text-jk-navy-mid dark:bg-white/10 dark:text-white",
  },
  {
    key: "monthlyRevenue" as const,
    href: "/invoices",
    icon: DollarSign,
    iconClassName:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  {
    key: "monthlyExpenses" as const,
    href: "/expenses",
    icon: Receipt,
    iconClassName:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  },
  {
    key: "pendingLeaveRequests" as const,
    href: "/employees",
    icon: CalendarClock,
    iconClassName:
      "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  },
  {
    key: "openPositions" as const,
    href: "/recruitment",
    icon: Briefcase,
    iconClassName:
      "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
  },
];

export function KpiGrid({ kpis, isLoading = false }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5 2xl:grid-cols-6">
      {kpiConfig.map(({ key, href, icon, iconClassName }) => {
        const metric = kpis?.[key];

        return (
          <Link
            key={key}
            href={href}
            className="focus-visible:ring-primary/40 block h-full min-w-0 rounded-2xl outline-none focus-visible:ring-2"
          >
            <KpiCard
              label={metric?.label ?? key}
              value={metric?.value ?? 0}
              trend={metric?.trend ?? 0}
              trendDirection={metric?.trendDirection ?? "neutral"}
              format={metric?.format}
              icon={icon}
              iconClassName={iconClassName}
              isLoading={isLoading}
            />
          </Link>
        );
      })}
    </div>
  );
}
