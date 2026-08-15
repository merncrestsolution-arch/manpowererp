import {
  BarChart3,
  Briefcase,
  Building2,
  Clock,
  FileText,
  Landmark,
  LayoutDashboard,
  MapPinned,
  Receipt,
  Settings,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import type { Role } from "@/types/auth";
import type { NavGroup } from "@/types/navigation";

const ALL_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "HR_MANAGER",
  "FINANCE_MANAGER",
  "RECRUITER",
  "EMPLOYEE",
];

const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];

const HR_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "RECRUITER"];

const FINANCE_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "FINANCE_MANAGER"];

const OPERATIONS_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "HR_MANAGER",
  "RECRUITER",
  "EMPLOYEE",
];

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        allowedRoles: ALL_ROLES,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Employees",
        href: "/employees",
        icon: Users,
        allowedRoles: HR_ROLES,
      },
      {
        label: "Clients",
        href: "/clients",
        icon: Building2,
        allowedRoles: [...ADMIN_ROLES, "HR_MANAGER", "RECRUITER"],
      },
      {
        label: "Recruitment",
        href: "/recruitment",
        icon: UserPlus,
        allowedRoles: HR_ROLES,
      },
      {
        label: "Deployment",
        href: "/deployment",
        icon: MapPinned,
        allowedRoles: [...ADMIN_ROLES, "HR_MANAGER"],
      },
      {
        label: "Attendance",
        href: "/attendance",
        icon: Clock,
        allowedRoles: OPERATIONS_ROLES,
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        label: "Payroll",
        href: "/payroll",
        icon: Wallet,
        allowedRoles: [...ADMIN_ROLES, "FINANCE_MANAGER", "HR_MANAGER"],
      },
      {
        label: "Expenses",
        href: "/expenses",
        icon: Receipt,
        allowedRoles: ALL_ROLES,
      },
      {
        label: "Invoices",
        href: "/invoices",
        icon: FileText,
        allowedRoles: FINANCE_ROLES,
      },
      {
        label: "Finance",
        href: "/finance",
        icon: Landmark,
        allowedRoles: FINANCE_ROLES,
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        label: "Reports",
        href: "/reports",
        icon: BarChart3,
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "FINANCE_MANAGER"],
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Admin",
        href: "/admin",
        icon: Briefcase,
        allowedRoles: ADMIN_ROLES,
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        allowedRoles: ADMIN_ROLES,
      },
    ],
  },
];

export const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  employees: "Employees",
  clients: "Clients",
  recruitment: "Recruitment",
  deployment: "Deployment",
  "work-locations": "Work Locations",
  availability: "Availability",
  attendance: "Attendance",
  payroll: "Payroll",
  expenses: "Expenses",
  invoices: "Invoices",
  quotations: "Quotations",
  outstanding: "Outstanding",
  finance: "Finance",
  accounts: "Accounts",
  "cash-book": "Cash Book",
  "profit-and-loss": "Profit & Loss",
  "balance-sheet": "Balance Sheet",
  "cash-flow": "Cash Flow",
  categories: "Categories",
  approvals: "Approvals",
  reports: "Reports",
  settings: "Settings",
  company: "Company",
  users: "Users",
  "roles-permissions": "Roles & Permissions",
  backup: "Backup",
  "audit-logs": "Audit Logs",
  admin: "Admin",
  "design-system": "Design System",
  "mobile-preview": "Mobile Companion",
};

export const pageTitles: Record<string, string> = {
  ...routeLabels,
};

export function filterNavGroupsByRole(
  groups: NavGroup[],
  role: Role,
): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.allowedRoles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);
}

export function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  if (!lastSegment) {
    return "Dashboard";
  }

  if (routeLabels[lastSegment]) {
    return routeLabels[lastSegment];
  }

  return lastSegment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
