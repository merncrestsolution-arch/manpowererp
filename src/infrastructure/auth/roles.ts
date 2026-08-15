import type { Role } from "@prisma/client";

export const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];

export const HR_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "HR_MANAGER",
  "RECRUITER",
];

export const LEAVE_APPROVER_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "HR_MANAGER",
];

export const CLIENT_MANAGER_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "HR_MANAGER",
  "RECRUITER",
];

export const CLIENT_ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];

export const RECRUITMENT_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "HR_MANAGER",
  "RECRUITER",
];

export function hasAdminAccess(role: Role): boolean {
  return ADMIN_ROLES.includes(role);
}

export function hasHrAccess(role: Role): boolean {
  return HR_ROLES.includes(role);
}

export function canApproveLeave(role: Role): boolean {
  return LEAVE_APPROVER_ROLES.includes(role);
}

export function canManageEmployees(role: Role): boolean {
  return hasHrAccess(role);
}

export function canManageClients(role: Role): boolean {
  return CLIENT_MANAGER_ROLES.includes(role);
}

export function canBlacklistClient(role: Role): boolean {
  return CLIENT_ADMIN_ROLES.includes(role);
}

export function canTerminateContract(role: Role): boolean {
  return CLIENT_ADMIN_ROLES.includes(role);
}

export function canManageRecruitment(role: Role): boolean {
  return RECRUITMENT_ROLES.includes(role);
}

export function canChangeCandidateStatus(role: Role): boolean {
  return RECRUITMENT_ROLES.includes(role);
}

export function canPlaceCandidate(role: Role): boolean {
  return RECRUITMENT_ROLES.includes(role);
}

export const DEPLOYMENT_MANAGER_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "HR_MANAGER",
];

export const DEPLOYMENT_ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];

export function canManageDeployment(role: Role): boolean {
  return DEPLOYMENT_MANAGER_ROLES.includes(role);
}

export function canEndDeployment(role: Role): boolean {
  return DEPLOYMENT_MANAGER_ROLES.includes(role);
}

export function canReassignShift(role: Role): boolean {
  return DEPLOYMENT_MANAGER_ROLES.includes(role);
}

export const EXPENSE_SUBMITTER_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "HR_MANAGER",
  "FINANCE_MANAGER",
  "RECRUITER",
  "EMPLOYEE",
];

export const EXPENSE_APPROVER_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "FINANCE_MANAGER",
];

export const EXPENSE_CATEGORY_MANAGER_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "FINANCE_MANAGER",
];

export function canSubmitExpense(role: Role): boolean {
  return EXPENSE_SUBMITTER_ROLES.includes(role);
}

export function canApproveExpense(role: Role): boolean {
  return EXPENSE_APPROVER_ROLES.includes(role);
}

export function canManageExpenseCategories(role: Role): boolean {
  return EXPENSE_CATEGORY_MANAGER_ROLES.includes(role);
}

export const PAYROLL_MANAGER_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "FINANCE_MANAGER",
];

export function canManagePayroll(role: Role): boolean {
  return PAYROLL_MANAGER_ROLES.includes(role);
}

export function canRunPayroll(role: Role): boolean {
  return PAYROLL_MANAGER_ROLES.includes(role);
}

export function canFinalizePayslip(role: Role): boolean {
  return PAYROLL_MANAGER_ROLES.includes(role);
}

export function canConfigureSalaryComponents(role: Role): boolean {
  return PAYROLL_MANAGER_ROLES.includes(role);
}

export const ATTENDANCE_MANAGER_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "HR_MANAGER",
];

export function canManageAttendance(role: Role): boolean {
  return ATTENDANCE_MANAGER_ROLES.includes(role);
}

export function canManualAttendanceEntry(role: Role): boolean {
  return ATTENDANCE_MANAGER_ROLES.includes(role);
}

export function canApproveOvertime(role: Role): boolean {
  return ATTENDANCE_MANAGER_ROLES.includes(role);
}

export function canSelfCheckAttendance(): boolean {
  return true;
}

export const INVOICE_MANAGER_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "FINANCE_MANAGER",
];

export function canManageInvoices(role: Role): boolean {
  return INVOICE_MANAGER_ROLES.includes(role);
}

export function canRecordPayments(role: Role): boolean {
  return INVOICE_MANAGER_ROLES.includes(role);
}

export function canConvertQuotation(role: Role): boolean {
  return INVOICE_MANAGER_ROLES.includes(role);
}

export const FINANCE_MANAGER_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "FINANCE_MANAGER",
];

export function canManageFinance(role: Role): boolean {
  return FINANCE_MANAGER_ROLES.includes(role);
}

export function canPostJournal(role: Role): boolean {
  return FINANCE_MANAGER_ROLES.includes(role);
}

export const REPORT_VIEWER_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "HR_MANAGER",
  "FINANCE_MANAGER",
];

export const HR_REPORT_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "HR_MANAGER"];

export const RECRUITMENT_REPORT_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "HR_MANAGER",
];

export const DEPLOYMENT_REPORT_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "HR_MANAGER",
];

export function canViewReports(role: Role): boolean {
  return REPORT_VIEWER_ROLES.includes(role);
}

export function canViewHrReports(role: Role): boolean {
  return HR_REPORT_ROLES.includes(role);
}

export function canViewRecruitmentReports(role: Role): boolean {
  return RECRUITMENT_REPORT_ROLES.includes(role);
}

export function canViewDeploymentReports(role: Role): boolean {
  return DEPLOYMENT_REPORT_ROLES.includes(role);
}

export function canViewFinanceReports(role: Role): boolean {
  return FINANCE_MANAGER_ROLES.includes(role);
}

export function canManageSettings(role: Role): boolean {
  return ADMIN_ROLES.includes(role);
}
