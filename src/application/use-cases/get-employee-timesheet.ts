import { eachDayOfInterval } from "date-fns";

import { prisma } from "@/infrastructure/db/prisma";
import {
  getColomboDateKey,
  getColomboMonthRange,
  getColomboWeekRange,
  getWorkedHours,
  parseColomboDateKey,
  toColomboTime,
} from "@/lib/date";

import type { TimesheetQuery } from "@/application/dto/attendance.schema";
import type { EmployeeTimesheet, TimesheetDayEntry } from "@/types/attendance";

type GetEmployeeTimesheetParams = {
  branchId: string;
  query: TimesheetQuery;
};

type GetEmployeeTimesheetResult =
  | { success: true; timesheet: EmployeeTimesheet }
  | { success: false; error: string };

export async function getEmployeeTimesheet({
  branchId,
  query,
}: GetEmployeeTimesheetParams): Promise<GetEmployeeTimesheetResult> {
  if (!query.employeeId) {
    return { success: false, error: "Employee ID is required" };
  }

  const employee = await prisma.employee.findFirst({
    where: {
      id: query.employeeId,
      branchId,
      deletedAt: null,
    },
    select: {
      id: true,
      employeeNo: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!employee) {
    return { success: false, error: "Employee not found" };
  }

  const anchorDate = query.date ? parseColomboDateKey(query.date) : new Date();
  const range =
    query.period === "month"
      ? getColomboMonthRange(anchorDate)
      : getColomboWeekRange(anchorDate);

  const records = await prisma.attendanceRecord.findMany({
    where: {
      employeeId: employee.id,
      deletedAt: null,
      date: {
        gte: range.start,
        lte: range.end,
      },
    },
    include: {
      overtime: {
        where: { status: { in: ["PENDING", "APPROVED"] } },
        select: { hours: true },
      },
    },
    orderBy: { date: "asc" },
  });

  const recordByDate = new Map(
    records.map((record) => [getColomboDateKey(record.date), record]),
  );

  const colomboDays = eachDayOfInterval({
    start: toColomboTime(range.start),
    end: toColomboTime(range.end),
  });

  const days: TimesheetDayEntry[] = colomboDays.map((day) => {
    const dateKey = getColomboDateKey(day);
    const record = recordByDate.get(dateKey);

    if (!record) {
      return {
        date: dateKey,
        checkInAt: null,
        checkOutAt: null,
        status: "ABSENT",
        workedHours: null,
        overtimeHours: null,
      };
    }

    const workedHours =
      record.checkInAt && record.checkOutAt
        ? Number(getWorkedHours(record.checkInAt, record.checkOutAt).toFixed(2))
        : null;

    const overtimeHours = record.overtime.length
      ? Number(
          record.overtime
            .reduce((sum, item) => sum + item.hours.toNumber(), 0)
            .toFixed(2),
        )
      : null;

    return {
      date: dateKey,
      checkInAt: record.checkInAt?.toISOString() ?? null,
      checkOutAt: record.checkOutAt?.toISOString() ?? null,
      status: record.status,
      workedHours,
      overtimeHours,
    };
  });

  const totalWorkedHours = Number(
    days.reduce((sum, day) => sum + (day.workedHours ?? 0), 0).toFixed(2),
  );
  const totalOvertimeHours = Number(
    days.reduce((sum, day) => sum + (day.overtimeHours ?? 0), 0).toFixed(2),
  );

  return {
    success: true,
    timesheet: {
      employeeId: employee.id,
      employeeNo: employee.employeeNo,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      periodStart: getColomboDateKey(range.start),
      periodEnd: getColomboDateKey(range.end),
      totalWorkedHours,
      totalOvertimeHours,
      days,
    },
  };
}

export async function listEmployeeTimesheets(
  branchId: string,
  query: TimesheetQuery,
) {
  const anchorDate = query.date ? parseColomboDateKey(query.date) : new Date();
  const range =
    query.period === "month"
      ? getColomboMonthRange(anchorDate)
      : getColomboWeekRange(anchorDate);

  const employees = await prisma.employee.findMany({
    where: {
      branchId,
      deletedAt: null,
      status: { not: "TERMINATED" },
    },
    select: {
      id: true,
      employeeNo: true,
      firstName: true,
      lastName: true,
    },
    orderBy: { employeeNo: "asc" },
  });

  const summaries = await Promise.all(
    employees.map(async (employee) => {
      const result = await getEmployeeTimesheet({
        branchId,
        query: { ...query, employeeId: employee.id },
      });

      if (!result.success) {
        return null;
      }

      return {
        employeeId: employee.id,
        employeeNo: employee.employeeNo,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        periodStart: result.timesheet.periodStart,
        periodEnd: result.timesheet.periodEnd,
        totalWorkedHours: result.timesheet.totalWorkedHours,
        totalOvertimeHours: result.timesheet.totalOvertimeHours,
        presentDays: result.timesheet.days.filter((day) =>
          ["PRESENT", "LATE", "HALF_DAY"].includes(day.status),
        ).length,
      };
    }),
  );

  return {
    periodStart: getColomboDateKey(range.start),
    periodEnd: getColomboDateKey(range.end),
    items: summaries.filter((item) => item !== null),
  };
}
