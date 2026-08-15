import type {
  EmployeeSalaryComponentItem,
  PayrollPeriodDetail,
  PayrollPeriodListItem,
  PayslipDetail,
  PayslipListItem,
  SalaryComponentItem,
} from "@/types/payroll";

function toNumber(
  value: { toString(): string } | number | null | undefined,
): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return typeof value === "number" ? value : Number(value);
}

type PeriodWithCounts = {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  payDate: Date;
  status: PayrollPeriodListItem["status"];
  createdAt: Date;
  _count?: { payslips: number };
  payslips?: Array<{
    netSalary: { toString(): string };
    grossSalary: { toString(): string };
    status: string;
  }>;
};

export function mapPayrollPeriodToListItem(
  period: PeriodWithCounts,
): PayrollPeriodListItem {
  const payslips = period.payslips ?? [];
  const totalNet = payslips.reduce(
    (sum, payslip) => sum + toNumber(payslip.netSalary),
    0,
  );

  return {
    id: period.id,
    periodStart: period.periodStart.toISOString(),
    periodEnd: period.periodEnd.toISOString(),
    payDate: period.payDate.toISOString(),
    status: period.status,
    payslipCount: period._count?.payslips ?? payslips.length,
    totalNet,
    createdAt: period.createdAt.toISOString(),
  };
}

export function mapPayrollPeriodToDetail(
  period: PeriodWithCounts,
): PayrollPeriodDetail {
  const payslips = period.payslips ?? [];
  const base = mapPayrollPeriodToListItem(period);

  return {
    ...base,
    totalGross: payslips.reduce(
      (sum, payslip) => sum + toNumber(payslip.grossSalary),
      0,
    ),
    draftCount: payslips.filter((p) => p.status === "DRAFT").length,
    finalizedCount: payslips.filter(
      (p) => p.status === "FINALIZED" || p.status === "PAID",
    ).length,
  };
}

export function mapSalaryComponentToItem(component: {
  id: string;
  name: string;
  type: SalaryComponentItem["type"];
  calculationType: SalaryComponentItem["calculationType"];
  defaultValue: { toString(): string };
  isTaxable: boolean;
  isActive: boolean;
  createdAt: Date;
}): SalaryComponentItem {
  return {
    id: component.id,
    name: component.name,
    type: component.type,
    calculationType: component.calculationType,
    defaultValue: toNumber(component.defaultValue),
    isTaxable: component.isTaxable,
    isActive: component.isActive,
    createdAt: component.createdAt.toISOString(),
  };
}

export function mapEmployeeSalaryComponentToItem(assignment: {
  id: string;
  salaryComponentId: string;
  value: { toString(): string } | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  salaryComponent: {
    name: string;
    type: EmployeeSalaryComponentItem["componentType"];
    calculationType: EmployeeSalaryComponentItem["calculationType"];
  };
}): EmployeeSalaryComponentItem {
  return {
    id: assignment.id,
    salaryComponentId: assignment.salaryComponentId,
    componentName: assignment.salaryComponent.name,
    componentType: assignment.salaryComponent.type,
    calculationType: assignment.salaryComponent.calculationType,
    value: assignment.value ? toNumber(assignment.value) : null,
    effectiveFrom: assignment.effectiveFrom.toISOString(),
    effectiveTo: assignment.effectiveTo?.toISOString() ?? null,
  };
}

type PayslipWithEmployee = {
  id: string;
  payslipNo: string;
  employeeId: string;
  basicSalary: { toString(): string };
  totalAllowances: { toString(): string };
  totalDeductions: { toString(): string };
  overtimePay: { toString(): string };
  grossSalary: { toString(): string };
  netSalary: { toString(): string };
  status: PayslipListItem["status"];
  employee: {
    employeeNo: string;
    firstName: string;
    lastName: string;
    department: string | null;
  };
};

export function mapPayslipToListItem(
  payslip: PayslipWithEmployee,
): PayslipListItem {
  return {
    id: payslip.id,
    payslipNo: payslip.payslipNo,
    employeeId: payslip.employeeId,
    employeeNo: payslip.employee.employeeNo,
    employeeName: `${payslip.employee.firstName} ${payslip.employee.lastName}`,
    department: payslip.employee.department,
    basicSalary: toNumber(payslip.basicSalary),
    totalAllowances: toNumber(payslip.totalAllowances),
    totalDeductions: toNumber(payslip.totalDeductions),
    overtimePay: toNumber(payslip.overtimePay),
    grossSalary: toNumber(payslip.grossSalary),
    netSalary: toNumber(payslip.netSalary),
    status: payslip.status,
  };
}

export function mapPayslipToDetail(
  payslip: PayslipWithEmployee & {
    payrollPeriodId: string;
    pdfUrl: string | null;
    createdAt: Date;
    payrollPeriod: { periodStart: Date; periodEnd: Date; payDate: Date };
    lineItems: Array<{
      id: string;
      label: string;
      type: PayslipDetail["lineItems"][number]["type"];
      amount: { toString(): string };
      isTaxable: boolean;
    }>;
  },
): PayslipDetail {
  return {
    ...mapPayslipToListItem(payslip),
    payrollPeriodId: payslip.payrollPeriodId,
    periodStart: payslip.payrollPeriod.periodStart.toISOString(),
    periodEnd: payslip.payrollPeriod.periodEnd.toISOString(),
    payDate: payslip.payrollPeriod.payDate.toISOString(),
    pdfUrl: payslip.pdfUrl,
    createdAt: payslip.createdAt.toISOString(),
    lineItems: payslip.lineItems.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      amount: toNumber(item.amount),
      isTaxable: item.isTaxable,
    })),
  };
}
