import {
  Briefcase,
  Building2,
  DollarSign,
  Receipt,
  Truck,
  Users,
} from "lucide-react";

import { ReportCategoryCard } from "@/components/reports/report-category-card";
import { ReportsHubNav } from "@/components/reports/reports-hub-nav";
import { PageShell } from "@/components/shared/page-shell";

const categories = [
  {
    title: "HR",
    description: "Headcount, attendance trends, and leave utilization",
    href: "/reports/hr/headcount",
    icon: Users,
    links: [
      { label: "Headcount", href: "/reports/hr/headcount" },
      { label: "Attendance", href: "/reports/hr/attendance" },
      { label: "Leave", href: "/reports/hr/leave" },
    ],
  },
  {
    title: "Recruitment",
    description: "Pipeline funnel, time-to-hire, and source of hire",
    href: "/reports/recruitment/pipeline",
    icon: Briefcase,
    links: [
      { label: "Pipeline", href: "/reports/recruitment/pipeline" },
      { label: "Source of hire", href: "/reports/recruitment/source-of-hire" },
    ],
  },
  {
    title: "Deployment",
    description: "Active deployments and location utilization",
    href: "/reports/deployment/active-deployments",
    icon: Truck,
    links: [
      {
        label: "Active deployments",
        href: "/reports/deployment/active-deployments",
      },
      {
        label: "Location utilization",
        href: "/reports/deployment/location-utilization",
      },
    ],
  },
  {
    title: "Payroll",
    description: "Payroll summary, trends, and department costs",
    href: "/reports/payroll",
    icon: DollarSign,
    links: [{ label: "Payroll", href: "/reports/payroll" }],
  },
  {
    title: "Expenses",
    description: "Expense breakdown and spending trends",
    href: "/reports/expenses",
    icon: Receipt,
    links: [{ label: "Expenses", href: "/reports/expenses" }],
  },
  {
    title: "Invoices & Finance",
    description: "Outstanding receivables, P&L, and cash flow",
    href: "/reports/finance",
    icon: Building2,
    links: [{ label: "Finance", href: "/reports/finance" }],
  },
];

export default function ReportsHubPage() {
  return (
    <PageShell
      title="Reports"
      description="Enterprise analytics across HR, operations, payroll, and finance."
    >
      <ReportsHubNav items={categories.flatMap((category) => category.links)} />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <ReportCategoryCard
            key={category.title}
            title={category.title}
            description={category.description}
            href={category.href}
            icon={category.icon}
          />
        ))}
      </div>
    </PageShell>
  );
}
