import { prisma } from "@/infrastructure/db/prisma";

import type { AssignEmployeeShiftInput } from "@/application/dto/employee-shift.schema";
import type { EmployeeShiftItem } from "@/types/employee";

function mapEmployeeShift(
  assignment: {
    id: string;
    effectiveFrom: Date;
    effectiveTo: Date | null;
    shift: { id: string; name: string; startTime: string; endTime: string };
  },
  now = new Date(),
): EmployeeShiftItem {
  const isCurrent =
    assignment.effectiveFrom <= now &&
    (!assignment.effectiveTo || assignment.effectiveTo >= now);

  return {
    id: assignment.id,
    shiftId: assignment.shift.id,
    shiftName: assignment.shift.name,
    startTime: assignment.shift.startTime,
    endTime: assignment.shift.endTime,
    effectiveFrom: assignment.effectiveFrom.toISOString(),
    effectiveTo: assignment.effectiveTo?.toISOString() ?? null,
    isCurrent,
  };
}

export async function listEmployeeShifts(
  branchId: string,
  employeeId: string,
): Promise<EmployeeShiftItem[]> {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, branchId },
    select: { id: true },
  });

  if (!employee) {
    return [];
  }

  const assignments = await prisma.employeeShift.findMany({
    where: { employeeId, deletedAt: null },
    include: {
      shift: {
        select: { id: true, name: true, startTime: true, endTime: true },
      },
    },
    orderBy: { effectiveFrom: "desc" },
  });

  return assignments.map((assignment) => mapEmployeeShift(assignment));
}

export async function listBranchShifts(branchId: string) {
  return prisma.shift.findMany({
    where: { branchId, deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, startTime: true, endTime: true },
  });
}

type AssignEmployeeShiftParams = {
  branchId: string;
  employeeId: string;
  userId: string;
  input: AssignEmployeeShiftInput;
};

export async function assignEmployeeShift({
  branchId,
  employeeId,
  userId,
  input,
}: AssignEmployeeShiftParams): Promise<
  | { success: true; assignment: EmployeeShiftItem }
  | { success: false; error: string }
> {
  const [employee, shift] = await Promise.all([
    prisma.employee.findFirst({
      where: { id: employeeId, branchId, deletedAt: null },
    }),
    prisma.shift.findFirst({
      where: { id: input.shiftId, branchId, deletedAt: null },
    }),
  ]);

  if (!employee) {
    return { success: false, error: "Employee not found" };
  }

  if (!shift) {
    return { success: false, error: "Shift not found" };
  }

  const effectiveFrom = new Date(input.effectiveFrom);
  const effectiveTo = input.effectiveTo ? new Date(input.effectiveTo) : null;

  const assignment = await prisma.$transaction(async (tx) => {
    await tx.employeeShift.updateMany({
      where: {
        employeeId,
        deletedAt: null,
        effectiveTo: null,
        effectiveFrom: { lte: effectiveFrom },
      },
      data: {
        effectiveTo: effectiveFrom,
        updatedBy: userId,
      },
    });

    return tx.employeeShift.create({
      data: {
        employeeId,
        shiftId: input.shiftId,
        effectiveFrom,
        effectiveTo,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        shift: {
          select: { id: true, name: true, startTime: true, endTime: true },
        },
      },
    });
  });

  return {
    success: true,
    assignment: mapEmployeeShift(assignment),
  };
}
