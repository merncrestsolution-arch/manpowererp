import { prisma } from "@/infrastructure/db/prisma";
import { getShiftDurationHours, getWorkedHours } from "@/lib/date";

type CalculateOvertimeParams = {
  attendanceRecordId: string;
  userId: string;
};

type CalculateOvertimeResult = {
  created: boolean;
  hours: number;
};

export async function calculateOvertimeForAttendance({
  attendanceRecordId,
  userId,
}: CalculateOvertimeParams): Promise<CalculateOvertimeResult> {
  const record = await prisma.attendanceRecord.findFirst({
    where: { id: attendanceRecordId, deletedAt: null },
    include: {
      deployment: {
        include: {
          shift: {
            select: { startTime: true, endTime: true },
          },
        },
      },
    },
  });

  if (!record?.checkInAt || !record.checkOutAt || !record.deployment?.shift) {
    return { created: false, hours: 0 };
  }

  const workedHours = getWorkedHours(record.checkInAt, record.checkOutAt);
  const shiftHours = getShiftDurationHours(
    record.deployment.shift.startTime,
    record.deployment.shift.endTime,
  );
  const overtimeHours = Number(
    Math.max(0, workedHours - shiftHours).toFixed(2),
  );

  if (overtimeHours <= 0) {
    await prisma.overtimeRecord.deleteMany({
      where: {
        attendanceRecordId,
        status: "PENDING",
      },
    });

    return { created: false, hours: 0 };
  }

  const existing = await prisma.overtimeRecord.findFirst({
    where: { attendanceRecordId },
  });

  if (existing) {
    await prisma.overtimeRecord.update({
      where: { id: existing.id },
      data: {
        hours: overtimeHours,
        updatedBy: userId,
      },
    });

    return { created: existing.status === "PENDING", hours: overtimeHours };
  }

  await prisma.overtimeRecord.create({
    data: {
      attendanceRecordId,
      employeeId: record.employeeId,
      hours: overtimeHours,
      rateMultiplier: 1.5,
      status: "PENDING",
      createdBy: userId,
      updatedBy: userId,
    },
  });

  return { created: true, hours: overtimeHours };
}
