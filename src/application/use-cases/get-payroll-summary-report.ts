import { format } from "date-fns";

import { decimalToNumber } from "@/application/use-cases/payroll-calculations";
import { prisma } from "@/infrastructure/db/prisma";

import type { PayrollSummaryReport } from "@/types/payroll";

export async function getPayrollSummaryReport(
  branchId: string,
  periodId?: string,
): Promise<PayrollSummaryReport> {
  const periods = await prisma.payrollPeriod.findMany({
    where: { branchId, deletedAt: null },
    orderBy: { periodStart: "desc" },
    take: 12,
    include: {
      payslips: {
        where: { deletedAt: null, status: { in: ["FINALIZED", "PAID"] } },
        select: {
          grossSalary: true,
          netSalary: true,
          totalDeductions: true,
          overtimePay: true,
          employee: { select: { department: true } },
        },
      },
    },
  });

  const trend = periods
    .slice()
    .reverse()
    .map((period) => ({
      periodId: period.id,
      periodLabel: format(period.periodStart, "MMM yyyy"),
      gross: period.payslips.reduce(
        (sum, payslip) => sum + decimalToNumber(payslip.grossSalary),
        0,
      ),
      net: period.payslips.reduce(
        (sum, payslip) => sum + decimalToNumber(payslip.netSalary),
        0,
      ),
    }));

  const selectedPeriod = periodId
    ? periods.find((period) => period.id === periodId)
    : periods[0];

  if (!selectedPeriod) {
    return {
      periodId: null,
      periodLabel: "No periods",
      totalGross: 0,
      totalNet: 0,
      totalDeductions: 0,
      totalOvertime: 0,
      employeeCount: 0,
      byDepartment: [],
      trend,
    };
  }

  const payslips = selectedPeriod.payslips;
  const departmentMap = new Map<
    string,
    { gross: number; net: number; count: number }
  >();

  for (const payslip of payslips) {
    const department = payslip.employee.department ?? "Unassigned";
    const current = departmentMap.get(department) ?? {
      gross: 0,
      net: 0,
      count: 0,
    };

    departmentMap.set(department, {
      gross: current.gross + decimalToNumber(payslip.grossSalary),
      net: current.net + decimalToNumber(payslip.netSalary),
      count: current.count + 1,
    });
  }

  return {
    periodId: selectedPeriod.id,
    periodLabel: `${format(selectedPeriod.periodStart, "dd MMM yyyy")} – ${format(selectedPeriod.periodEnd, "dd MMM yyyy")}`,
    totalGross: payslips.reduce(
      (sum, payslip) => sum + decimalToNumber(payslip.grossSalary),
      0,
    ),
    totalNet: payslips.reduce(
      (sum, payslip) => sum + decimalToNumber(payslip.netSalary),
      0,
    ),
    totalDeductions: payslips.reduce(
      (sum, payslip) => sum + decimalToNumber(payslip.totalDeductions),
      0,
    ),
    totalOvertime: payslips.reduce(
      (sum, payslip) => sum + decimalToNumber(payslip.overtimePay),
      0,
    ),
    employeeCount: payslips.length,
    byDepartment: Array.from(departmentMap.entries())
      .map(([department, totals]) => ({
        department,
        ...totals,
      }))
      .sort((a, b) => b.net - a.net),
    trend,
  };
}
