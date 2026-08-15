import type { Role } from "@prisma/client";

export type PermissionSeed = {
  code: string;
  module: string;
  description: string;
};

export const PERMISSION_CATALOG: PermissionSeed[] = [
  { code: "employee.view", module: "Employee", description: "View employees" },
  {
    code: "employee.create",
    module: "Employee",
    description: "Create employees",
  },
  {
    code: "employee.update",
    module: "Employee",
    description: "Update employees",
  },
  { code: "client.view", module: "Client", description: "View clients" },
  { code: "client.create", module: "Client", description: "Create clients" },
  { code: "client.update", module: "Client", description: "Update clients" },
  {
    code: "client.blacklist",
    module: "Client",
    description: "Blacklist clients",
  },
  {
    code: "recruitment.view",
    module: "Recruitment",
    description: "View recruitment",
  },
  {
    code: "recruitment.manage",
    module: "Recruitment",
    description: "Manage candidates and job openings",
  },
  {
    code: "recruitment.place",
    module: "Recruitment",
    description: "Place candidates",
  },
  {
    code: "deployment.view",
    module: "Deployment",
    description: "View deployments",
  },
  {
    code: "deployment.manage",
    module: "Deployment",
    description: "Manage deployments",
  },
  {
    code: "attendance.view",
    module: "Attendance",
    description: "View attendance",
  },
  {
    code: "attendance.manage",
    module: "Attendance",
    description: "Manage attendance and overtime",
  },
  {
    code: "attendance.self",
    module: "Attendance",
    description: "Self check-in/out",
  },
  { code: "payroll.view", module: "Payroll", description: "View payroll" },
  {
    code: "payroll.run",
    module: "Payroll",
    description: "Run payroll periods",
  },
  {
    code: "payroll.finalize",
    module: "Payroll",
    description: "Finalize payslips",
  },
  {
    code: "payroll.configure",
    module: "Payroll",
    description: "Configure salary components",
  },
  { code: "expense.view", module: "Expenses", description: "View expenses" },
  {
    code: "expense.submit",
    module: "Expenses",
    description: "Submit expenses",
  },
  {
    code: "expense.approve",
    module: "Expenses",
    description: "Approve expenses",
  },
  {
    code: "expense.categories",
    module: "Expenses",
    description: "Manage expense categories",
  },
  {
    code: "invoice.view",
    module: "Invoices",
    description: "View invoices and quotations",
  },
  {
    code: "invoice.manage",
    module: "Invoices",
    description: "Manage invoices and quotations",
  },
  {
    code: "invoice.payment",
    module: "Invoices",
    description: "Record payments",
  },
  {
    code: "finance.view",
    module: "Finance",
    description: "View finance reports",
  },
  {
    code: "finance.manage",
    module: "Finance",
    description: "Manage chart of accounts and journals",
  },
  { code: "reports.view", module: "Reports", description: "View reports hub" },
  { code: "reports.hr", module: "Reports", description: "View HR reports" },
  {
    code: "reports.finance",
    module: "Reports",
    description: "View finance reports",
  },
  {
    code: "settings.company",
    module: "Settings",
    description: "Manage company settings",
  },
  { code: "settings.users", module: "Settings", description: "Manage users" },
  {
    code: "settings.permissions",
    module: "Settings",
    description: "Manage role permissions",
  },
  {
    code: "settings.backup",
    module: "Settings",
    description: "Trigger database backups",
  },
  {
    code: "settings.audit",
    module: "Settings",
    description: "View audit logs",
  },
];

/**
 * Default grants per role — mirrors hardcoded RBAC in roles.ts (Phases 2–14).
 * Existing use-cases still use can*() helpers; this matrix is the configurable layer.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, string[]> = {
  SUPER_ADMIN: PERMISSION_CATALOG.map((permission) => permission.code),
  ADMIN: PERMISSION_CATALOG.map((permission) => permission.code),
  HR_MANAGER: [
    "employee.view",
    "employee.create",
    "employee.update",
    "client.view",
    "client.create",
    "client.update",
    "recruitment.view",
    "recruitment.manage",
    "recruitment.place",
    "deployment.view",
    "deployment.manage",
    "attendance.view",
    "attendance.manage",
    "attendance.self",
    "expense.view",
    "expense.submit",
    "reports.view",
    "reports.hr",
  ],
  FINANCE_MANAGER: [
    "client.view",
    "expense.view",
    "expense.submit",
    "expense.approve",
    "expense.categories",
    "payroll.view",
    "payroll.run",
    "payroll.finalize",
    "payroll.configure",
    "invoice.view",
    "invoice.manage",
    "invoice.payment",
    "finance.view",
    "finance.manage",
    "reports.view",
    "reports.finance",
  ],
  RECRUITER: [
    "employee.view",
    "client.view",
    "client.create",
    "client.update",
    "recruitment.view",
    "recruitment.manage",
    "deployment.view",
    "expense.view",
    "expense.submit",
    "attendance.self",
    "reports.view",
  ],
  EMPLOYEE: ["attendance.self", "expense.view", "expense.submit"],
};
