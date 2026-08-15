export type PayrollPeriodStatus = "DRAFT" | "PROCESSING" | "FINALIZED" | "PAID";
export type SalaryComponentType = "ALLOWANCE" | "DEDUCTION";
export type SalaryCalculationType = "FIXED" | "PERCENTAGE_OF_BASIC";
export type PayslipStatus = "DRAFT" | "FINALIZED" | "PAID";
export type PayslipLineItemType =
  "BASIC" | "ALLOWANCE" | "DEDUCTION" | "OVERTIME";

export type PayrollPeriodListItem = {
  id: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  status: PayrollPeriodStatus;
  payslipCount: number;
  totalNet: number;
  createdAt: string;
};

export type PayrollPeriodDetail = PayrollPeriodListItem & {
  totalGross: number;
  draftCount: number;
  finalizedCount: number;
};

export type SalaryComponentItem = {
  id: string;
  name: string;
  type: SalaryComponentType;
  calculationType: SalaryCalculationType;
  defaultValue: number;
  isTaxable: boolean;
  isActive: boolean;
  createdAt: string;
};

export type EmployeeSalaryComponentItem = {
  id: string;
  salaryComponentId: string;
  componentName: string;
  componentType: SalaryComponentType;
  calculationType: SalaryCalculationType;
  value: number | null;
  effectiveFrom: string;
  effectiveTo: string | null;
};

export type PayslipListItem = {
  id: string;
  payslipNo: string;
  employeeId: string;
  employeeNo: string;
  employeeName: string;
  department: string | null;
  basicSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  overtimePay: number;
  grossSalary: number;
  netSalary: number;
  status: PayslipStatus;
};

export type PayslipLineItemDetail = {
  id: string;
  label: string;
  type: PayslipLineItemType;
  amount: number;
  isTaxable: boolean;
};

export type PayslipDetail = PayslipListItem & {
  payrollPeriodId: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  pdfUrl: string | null;
  lineItems: PayslipLineItemDetail[];
  createdAt: string;
};

export type RunPayrollResult = {
  periodId: string;
  created: number;
  skipped: number;
  failed: number;
  errors: string[];
};

export type PayrollSummaryReport = {
  periodId: string | null;
  periodLabel: string;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  totalOvertime: number;
  employeeCount: number;
  byDepartment: Array<{
    department: string;
    gross: number;
    net: number;
    count: number;
  }>;
  trend: Array<{
    periodLabel: string;
    periodId: string;
    gross: number;
    net: number;
  }>;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
