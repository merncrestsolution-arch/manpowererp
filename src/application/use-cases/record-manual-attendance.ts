import { mapAttendanceToDetail } from "@/application/mappers/attendance-mapper";
import { calculateOvertimeForAttendance } from "@/application/use-cases/calculate-overtime";
import { prisma } from "@/infrastructure/db/prisma";
import { parseColomboDateKey } from "@/lib/date";

import type { ManualAttendanceInput } from "@/application/dto/manual-attendance.schema";
import type { AttendanceDetail } from "@/types/attendance";

type RecordManualAttendanceParams = {
  branchId: string;
  userId: string;
  input: ManualAttendanceInput;
};

type RecordManualAttendanceResult =
  | { success: true; attendance: AttendanceDetail }
  | { success: false; error: string };

export async function recordManualAttendance({
  branchId,
  userId,
  input,
}: RecordManualAttendanceParams): Promise<RecordManualAttendanceResult> {
  const employee = await prisma.employee.findFirst({
    where: {
      id: input.employeeId,
      branchId,
      deletedAt: null,
    },
  });

  if (!employee) {
    return { success: false, error: "Employee not found" };
  }

  if (input.deploymentId) {
    const deployment = await prisma.deployment.findFirst({
      where: {
        id: input.deploymentId,
        branchId,
        employeeId: input.employeeId,
        deletedAt: null,
      },
    });

    if (!deployment) {
      return { success: false, error: "Deployment not found for employee" };
    }
  }

  const attendanceDate = parseColomboDateKey(input.date);
  const checkInAt = input.checkInAt ? new Date(input.checkInAt) : null;
  const checkOutAt = input.checkOutAt ? new Date(input.checkOutAt) : null;

  const record = await prisma.attendanceRecord.upsert({
    where: {
      employeeId_date: {
        employeeId: input.employeeId,
        date: attendanceDate,
      },
    },
    create: {
      employeeId: input.employeeId,
      deploymentId: input.deploymentId ?? null,
      date: attendanceDate,
      checkInAt,
      checkOutAt,
      checkInMethod: checkInAt ? "MANUAL" : null,
      checkOutMethod: checkOutAt ? "MANUAL" : null,
      status: input.status,
      enteredById: userId,
      manualReason: input.manualReason,
      createdBy: userId,
      updatedBy: userId,
    },
    update: {
      deploymentId: input.deploymentId ?? null,
      checkInAt,
      checkOutAt,
      checkInMethod: checkInAt ? "MANUAL" : null,
      checkOutMethod: checkOutAt ? "MANUAL" : null,
      status: input.status,
      enteredById: userId,
      manualReason: input.manualReason,
      updatedBy: userId,
      deletedAt: null,
    },
    include: {
      employee: {
        select: { employeeNo: true, firstName: true, lastName: true },
      },
      deployment: {
        select: { workLocation: { select: { name: true } } },
      },
      enteredBy: { select: { name: true } },
    },
  });

  if (record.checkInAt && record.checkOutAt) {
    await calculateOvertimeForAttendance({
      attendanceRecordId: record.id,
      userId,
    });
  }

  return { success: true, attendance: mapAttendanceToDetail(record) };
}
