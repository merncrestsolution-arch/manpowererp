import { prisma } from "@/infrastructure/db/prisma";

import type { ApproveOvertimeInput } from "@/application/dto/overtime.schema";
import type { OvertimeListItem } from "@/types/attendance";

type ApproveOvertimeParams = {
  branchId: string;
  overtimeId: string;
  approverId: string;
  input: ApproveOvertimeInput;
};

type ApproveOvertimeResult =
  | { success: true; overtime: OvertimeListItem }
  | { success: false; error: string };

export async function approveOvertime({
  branchId,
  overtimeId,
  approverId,
  input,
}: ApproveOvertimeParams): Promise<ApproveOvertimeResult> {
  const overtime = await prisma.overtimeRecord.findFirst({
    where: {
      id: overtimeId,
      status: "PENDING",
      employee: { branchId, deletedAt: null },
    },
    include: {
      employee: {
        select: {
          employeeNo: true,
          firstName: true,
          lastName: true,
        },
      },
      attendanceRecord: { select: { date: true } },
      approvedBy: { select: { name: true } },
    },
  });

  if (!overtime) {
    return { success: false, error: "Pending overtime record not found" };
  }

  const updated = await prisma.overtimeRecord.update({
    where: { id: overtimeId },
    data: {
      status: input.status,
      approvedById: approverId,
      updatedBy: approverId,
    },
    include: {
      employee: {
        select: {
          employeeNo: true,
          firstName: true,
          lastName: true,
        },
      },
      attendanceRecord: { select: { date: true } },
      approvedBy: { select: { name: true } },
    },
  });

  return {
    success: true,
    overtime: {
      id: updated.id,
      attendanceRecordId: updated.attendanceRecordId,
      employeeId: updated.employeeId,
      employeeNo: updated.employee.employeeNo,
      employeeName: `${updated.employee.firstName} ${updated.employee.lastName}`,
      date: updated.attendanceRecord.date.toISOString(),
      hours: updated.hours.toNumber(),
      rateMultiplier: updated.rateMultiplier.toNumber(),
      status: updated.status,
      approvedByName: updated.approvedBy?.name ?? null,
      createdAt: updated.createdAt.toISOString(),
    },
  };
}

export async function listOvertimeRecords(
  branchId: string,
  query: {
    page: number;
    pageSize: number;
    status?: "PENDING" | "APPROVED" | "REJECTED";
    employeeId?: string;
  },
) {
  const where = {
    employee: {
      branchId,
      deletedAt: null,
      ...(query.employeeId ? { id: query.employeeId } : {}),
    },
    ...(query.status ? { status: query.status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.overtimeRecord.findMany({
      where,
      include: {
        employee: {
          select: {
            employeeNo: true,
            firstName: true,
            lastName: true,
          },
        },
        attendanceRecord: { select: { date: true } },
        approvedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.overtimeRecord.count({ where }),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      attendanceRecordId: item.attendanceRecordId,
      employeeId: item.employeeId,
      employeeNo: item.employee.employeeNo,
      employeeName: `${item.employee.firstName} ${item.employee.lastName}`,
      date: item.attendanceRecord.date.toISOString(),
      hours: item.hours.toNumber(),
      rateMultiplier: item.rateMultiplier.toNumber(),
      status: item.status,
      approvedByName: item.approvedBy?.name ?? null,
      createdAt: item.createdAt.toISOString(),
    })),
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.ceil(total / query.pageSize) || 1,
  };
}
