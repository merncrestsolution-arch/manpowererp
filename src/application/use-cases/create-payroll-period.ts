import {
  mapPayrollPeriodToDetail,
  mapPayrollPeriodToListItem,
} from "@/application/mappers/payroll-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { CreatePayrollPeriodInput } from "@/application/dto/payroll-period.schema";
import type {
  PaginatedResult,
  PayrollPeriodDetail,
  PayrollPeriodListItem,
} from "@/types/payroll";

type CreatePayrollPeriodParams = {
  branchId: string;
  userId: string;
  input: CreatePayrollPeriodInput;
};

type CreatePayrollPeriodResult =
  | { success: true; period: PayrollPeriodDetail }
  | { success: false; error: string };

export async function createPayrollPeriod({
  branchId,
  userId,
  input,
}: CreatePayrollPeriodParams): Promise<CreatePayrollPeriodResult> {
  const periodStart = new Date(input.periodStart);
  const periodEnd = new Date(input.periodEnd);
  const payDate = new Date(input.payDate);

  const overlap = await prisma.payrollPeriod.findFirst({
    where: {
      branchId,
      deletedAt: null,
      periodStart: { lte: periodEnd },
      periodEnd: { gte: periodStart },
    },
  });

  if (overlap) {
    return {
      success: false,
      error: "A payroll period already exists for overlapping dates",
    };
  }

  const period = await prisma.payrollPeriod.create({
    data: {
      branchId,
      periodStart,
      periodEnd,
      payDate,
      status: "DRAFT",
      createdBy: userId,
      updatedBy: userId,
    },
    include: {
      _count: { select: { payslips: true } },
      payslips: {
        select: { netSalary: true, grossSalary: true, status: true },
      },
    },
  });

  return { success: true, period: mapPayrollPeriodToDetail(period) };
}

export async function getPayrollPeriod(
  branchId: string,
  periodId: string,
): Promise<PayrollPeriodDetail | null> {
  const period = await prisma.payrollPeriod.findFirst({
    where: { id: periodId, branchId, deletedAt: null },
    include: {
      _count: { select: { payslips: true } },
      payslips: {
        select: { netSalary: true, grossSalary: true, status: true },
      },
    },
  });

  return period ? mapPayrollPeriodToDetail(period) : null;
}

export async function listPayrollPeriods({
  branchId,
  query,
}: {
  branchId: string;
  query: {
    page: number;
    pageSize: number;
    status?: PayrollPeriodListItem["status"];
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
}): Promise<PaginatedResult<PayrollPeriodListItem>> {
  const where = {
    branchId,
    deletedAt: null,
    ...(query.status ? { status: query.status } : {}),
  };

  const [total, periods] = await Promise.all([
    prisma.payrollPeriod.count({ where }),
    prisma.payrollPeriod.findMany({
      where,
      include: {
        _count: { select: { payslips: true } },
        payslips: {
          select: { netSalary: true, grossSalary: true, status: true },
        },
      },
      orderBy: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);

  return {
    items: periods.map(mapPayrollPeriodToListItem),
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function updatePayrollPeriod({
  branchId,
  periodId,
  userId,
  input,
}: {
  branchId: string;
  periodId: string;
  userId: string;
  input: {
    periodStart?: string;
    periodEnd?: string;
    payDate?: string;
    status?: PayrollPeriodListItem["status"];
  };
}): Promise<CreatePayrollPeriodResult> {
  const existing = await prisma.payrollPeriod.findFirst({
    where: { id: periodId, branchId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Payroll period not found" };
  }

  if (existing.status === "FINALIZED" || existing.status === "PAID") {
    return {
      success: false,
      error: "Cannot modify a finalized or paid payroll period",
    };
  }

  const period = await prisma.payrollPeriod.update({
    where: { id: periodId },
    data: {
      ...(input.periodStart
        ? { periodStart: new Date(input.periodStart) }
        : {}),
      ...(input.periodEnd ? { periodEnd: new Date(input.periodEnd) } : {}),
      ...(input.payDate ? { payDate: new Date(input.payDate) } : {}),
      ...(input.status ? { status: input.status } : {}),
      updatedBy: userId,
    },
    include: {
      _count: { select: { payslips: true } },
      payslips: {
        select: { netSalary: true, grossSalary: true, status: true },
      },
    },
  });

  return { success: true, period: mapPayrollPeriodToDetail(period) };
}

export async function deletePayrollPeriod({
  branchId,
  periodId,
  userId,
}: {
  branchId: string;
  periodId: string;
  userId: string;
}): Promise<{ success: boolean; error?: string }> {
  const existing = await prisma.payrollPeriod.findFirst({
    where: { id: periodId, branchId, deletedAt: null },
    include: {
      payslips: {
        where: { deletedAt: null, status: { not: "DRAFT" } },
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!existing) {
    return { success: false, error: "Payroll period not found" };
  }

  if (existing.payslips.length > 0) {
    return {
      success: false,
      error: "Cannot delete a period with finalized payslips",
    };
  }

  await prisma.$transaction([
    prisma.payslip.updateMany({
      where: { payrollPeriodId: periodId, deletedAt: null },
      data: { deletedAt: new Date(), updatedBy: userId },
    }),
    prisma.payrollPeriod.update({
      where: { id: periodId },
      data: { deletedAt: new Date(), updatedBy: userId },
    }),
  ]);

  return { success: true };
}
