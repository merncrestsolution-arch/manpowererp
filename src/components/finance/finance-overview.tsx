"use client";

import { BookOpen, Landmark, LineChart, Scale, Wallet } from "lucide-react";

import { ModuleCard } from "@/components/shared/module-card";
import { PageShell } from "@/components/shared/page-shell";

const links = [
  {
    href: "/finance/accounts",
    title: "Chart of accounts",
    description: "Manage ledger accounts and view account ledgers",
    icon: BookOpen,
  },
  {
    href: "/finance/cash-book",
    title: "Cash book",
    description: "Track cash and bank movements with running balance",
    icon: Wallet,
  },
  {
    href: "/finance/reports/profit-and-loss",
    title: "Profit & loss",
    description: "Revenue minus expenses with period comparison",
    icon: LineChart,
  },
  {
    href: "/finance/reports/balance-sheet",
    title: "Balance sheet",
    description: "Assets, liabilities, and equity as of a date",
    icon: Scale,
  },
  {
    href: "/finance/reports/cash-flow",
    title: "Cash flow",
    description: "Cash movement grouped by source type",
    icon: Landmark,
  },
];

export function FinanceOverview() {
  return (
    <PageShell
      title="Finance"
      description="Cash book, ledger, and financial statements."
    >
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {links.map((link) => (
          <ModuleCard key={link.href} {...link} />
        ))}
      </div>
    </PageShell>
  );
}
