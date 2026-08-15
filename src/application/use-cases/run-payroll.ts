import {
  mapPayslipToDetail,
  mapPayslipToListItem,
} from "@/application/mappers/payroll-mapper";
import {
  computeEmployeePayroll,
  decimalToNumber,
} from "@/application/use-cases/payroll-calculations";
import { prisma } from "@/infrastructure/db/prisma";
import { formatPayslipNo, getNextSequenceValue } from "@/lib/sequence";

import type { ListPayslipsQuery } from "@/application/dto/employee-salary-component.schema";
import type {
  PaginatedResult,
  PayslipDetail,
  PayslipListItem,
  RunPayrollResult,
} from "@/types/payroll";

type RunPayrollParams = {
  branchId: string;
  periodId: string;
  userId: string;
};

export async function runPayroll({
  branchId,
  periodId,
  userId,
}: RunPayrollParams): Promise<RunPayrollResult> {
  const period = await prisma.payrollPeriod.findFirst({
    where: { id: periodId, branchId, deletedAt: null },
  });

  if (!period) {
    return {
      periodId,
      created: 0,
      skipped: 0,
      failed: 1,
      errors: ["Payroll period not found"],
    };
  }

  if (period.status === "FINALIZED" || period.status === "PAID") {
    return {
      periodId,
      created: 0,
      skipped: 0,
      failed: 1,
      errors: ["Cannot run payroll for a finalized or paid period"],
    };
  }

  await prisma.payrollPeriod.update({
    where: { id: periodId },
    data: { status: "PROCESSING", updatedBy: userId },
  });

  const employees = await prisma.employee.findMany({
    where: {
      branchId,
      deletedAt: null,
      status: { in: ["ACTIVE", "ON_LEAVE"] },
      basicSalary: { not: null },
    },
    select: { id: true, basicSalary: true, employeeNo: true },
  });

  let created = 0;
  let skipped = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const employee of employees) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const existing = await tx.payslip.findFirst({
          where: {
            payrollPeriodId: periodId,
            employeeId: employee.id,
            deletedAt: null,
          },
        });

        if (existing) {
          if (existing.status !== "DRAFT") {
            return { action: "skipped" as const };
          }

          await tx.payslipLineItem.deleteMany({
            where: { payslipId: existing.id },
          });
          await tx.payslip.delete({ where: { id: existing.id } });
        }

        const basicSalary = decimalToNumber(employee.basicSalary);
        if (basicSalary <= 0) {
          return { action: "skipped" as const };
        }

        const [assignments, overtimeRecords] = await Promise.all([
          tx.employeeSalaryComponent.findMany({
            where: {
              employeeId: employee.id,
              deletedAt: null,
              effectiveFrom: { lte: period.periodEnd },
              OR: [
                { effectiveTo: null },
                { effectiveTo: { gte: period.periodStart } },
              ],
              salaryComponent: {
                deletedAt: null,
                isActive: true,
                branchId,
              },
            },
            include: {
              salaryComponent: {
                select: {
                  name: true,
                  type: true,
                  calculationType: true,
                  defaultValue: true,
                  isTaxable: true,
                },
              },
            },
          }),
          tx.overtimeRecord.findMany({
            where: {
              employeeId: employee.id,
              status: "APPROVED",
              attendanceRecord: {
                date: {
                  gte: period.periodStart,
                  lte: period.periodEnd,
                },
                deletedAt: null,
              },
            },
            select: { hours: true, rateMultiplier: true },
          }),
        ]);

        const computation = computeEmployeePayroll(
          basicSalary,
          assignments,
          overtimeRecords,
        );

        const sequenceValue = await getNextSequenceValue(
          tx,
          branchId,
          "payslip_no",
        );
        const payslipNo = formatPayslipNo(sequenceValue);

        const payslip = await tx.payslip.create({
          data: {
            branchId,
            payslipNo,
            payrollPeriodId: periodId,
            employeeId: employee.id,
            basicSalary: computation.basicSalary,
            totalAllowances: computation.totalAllowances,
            totalDeductions: computation.totalDeductions,
            overtimePay: computation.overtimePay,
            grossSalary: computation.grossSalary,
            netSalary: computation.netSalary,
            status: "DRAFT",
            createdBy: userId,
            updatedBy: userId,
            lineItems: {
              create: computation.lineItems.map((item) => ({
                label: item.label,
                type: item.type,
                amount: item.amount,
                isTaxable: item.isTaxable,
              })),
            },
          },
        });

        return { action: "created" as const, payslipId: payslip.id };
      });

      if (result.action === "created") {
        created += 1;
      } else {
        skipped += 1;
      }
    } catch {
      failed += 1;
      errors.push(`Failed to generate payslip for ${employee.employeeNo}`);
    }
  }

  await prisma.payrollPeriod.update({
    where: { id: periodId },
    data: { status: "DRAFT", updatedBy: userId },
  });

  return { periodId, created, skipped, failed, errors };
}

export async function listPayslips({
  branchId,
  query,
}: {
  branchId: string;
  query: ListPayslipsQuery;
}): Promise<PaginatedResult<PayslipListItem>> {
  const where = {
    branchId,
    deletedAt: null,
    ...(query.payrollPeriodId
      ? { payrollPeriodId: query.payrollPeriodId }
      : {}),
    ...(query.employeeId ? { employeeId: query.employeeId } : {}),
    ...(query.status ? { status: query.status } : {}),
  };

  const [total, payslips] = await Promise.all([
    prisma.payslip.count({ where }),
    prisma.payslip.findMany({
      where,
      include: {
        employee: {
          select: {
            employeeNo: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
      orderBy: { payslipNo: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);

  return {
    items: payslips.map(mapPayslipToListItem),
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getPayslip(
  branchId: string,
  payslipId: string,
): Promise<PayslipDetail | null> {
  const payslip = await prisma.payslip.findFirst({
    where: { id: payslipId, branchId, deletedAt: null },
    include: {
      employee: {
        select: {
          employeeNo: true,
          firstName: true,
          lastName: true,
          department: true,
        },
      },
      payrollPeriod: {
        select: { periodStart: true, periodEnd: true, payDate: true },
      },
      lineItems: { orderBy: { type: "asc" } },
    },
  });

  return payslip ? mapPayslipToDetail(payslip) : null;
}
