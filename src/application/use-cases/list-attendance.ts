import { mapAttendanceToListItem } from "@/application/mappers/attendance-mapper";
import { prisma } from "@/infrastructure/db/prisma";
import {
  getColomboDayEnd,
  getColomboDayStart,
  parseColomboDateKey,
} from "@/lib/date";

import type { ListAttendanceQuery } from "@/application/dto/attendance.schema";
import type { Prisma } from "@prisma/client";

export async function listAttendance(
  branchId: string,
  query: ListAttendanceQuery,
) {
  const where: Prisma.AttendanceRecordWhereInput = {
    deletedAt: null,
    employee: {
      branchId,
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { firstName: { contains: query.search, mode: "insensitive" } },
              { lastName: { contains: query.search, mode: "insensitive" } },
              { employeeNo: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(query.employeeId ? { id: query.employeeId } : {}),
    },
    ...(query.status ? { status: query.status } : {}),
    ...(query.dateFrom || query.dateTo
      ? {
          date: {
            ...(query.dateFrom
              ? { gte: parseColomboDateKey(query.dateFrom) }
              : {}),
            ...(query.dateTo
              ? { lte: getColomboDayEnd(parseColomboDateKey(query.dateTo)) }
              : {}),
          },
        }
      : {}),
  };

  const orderBy: Prisma.AttendanceRecordOrderByWithRelationInput = {
    [query.sortBy]: query.sortOrder,
  };

  const [records, total] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where,
      include: {
        employee: {
          select: { employeeNo: true, firstName: true, lastName: true },
        },
        deployment: {
          select: { workLocation: { select: { name: true } } },
        },
      },
      orderBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.attendanceRecord.count({ where }),
  ]);

  return {
    items: records.map(mapAttendanceToListItem),
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.ceil(total / query.pageSize) || 1,
  };
}

export async function getEmployeeTodayAttendance(
  branchId: string,
  employeeId: string,
) {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, branchId, deletedAt: null },
    select: { id: true },
  });

  if (!employee) {
    return null;
  }

  const today = getColomboDayStart();

  const record = await prisma.attendanceRecord.findFirst({
    where: {
      employeeId,
      date: today,
      deletedAt: null,
    },
    include: {
      deployment: {
        include: {
          shift: { select: { startTime: true, endTime: true } },
        },
      },
    },
  });

  if (!record) {
    return {
      status: "NOT_RECORDED" as const,
      checkInTime: null,
      checkOutTime: null,
      workingHoursPercent: 0,
    };
  }

  const shift = record.deployment?.shift;
  let workingHoursPercent = 0;

  if (record.checkInAt && record.checkOutAt && shift) {
    const workedMs = record.checkOutAt.getTime() - record.checkInAt.getTime();
    const [startHour, startMinute] = shift.startTime.split(":").map(Number);
    const [endHour, endMinute] = shift.endTime.split(":").map(Number);
    let shiftMinutes =
      endHour * 60 + endMinute - (startHour * 60 + startMinute);
    if (shiftMinutes <= 0) {
      shiftMinutes += 24 * 60;
    }
    const shiftMs = shiftMinutes * 60 * 1000;
    workingHoursPercent = Math.min(100, Math.round((workedMs / shiftMs) * 100));
  } else if (record.checkInAt && !record.checkOutAt && shift) {
    const workedMs = Date.now() - record.checkInAt.getTime();
    const [startHour, startMinute] = shift.startTime.split(":").map(Number);
    const [endHour, endMinute] = shift.endTime.split(":").map(Number);
    let shiftMinutes =
      endHour * 60 + endMinute - (startHour * 60 + startMinute);
    if (shiftMinutes <= 0) {
      shiftMinutes += 24 * 60;
    }
    const shiftMs = shiftMinutes * 60 * 1000;
    workingHoursPercent = Math.min(100, Math.round((workedMs / shiftMs) * 100));
  }

  return {
    status: record.status,
    checkInTime: record.checkInAt?.toISOString() ?? null,
    checkOutTime: record.checkOutAt?.toISOString() ?? null,
    workingHoursPercent,
  };
}
