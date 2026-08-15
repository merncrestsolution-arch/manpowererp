import {
  getColomboDateKey,
  getColomboDayStart,
  parseShiftTimeOnDate,
} from "@/lib/date";

import type { AttendanceStatus } from "@prisma/client";

const LATE_GRACE_MINUTES = 15;

export function determineAttendanceStatus(
  checkInAt: Date,
  shiftStartTime: string | null,
): AttendanceStatus {
  if (!shiftStartTime) {
    return "PRESENT";
  }

  const dateKey = getColomboDateKey(checkInAt);
  const shiftStart = parseShiftTimeOnDate(dateKey, shiftStartTime);
  const graceMs = LATE_GRACE_MINUTES * 60 * 1000;

  if (checkInAt.getTime() > shiftStart.getTime() + graceMs) {
    return "LATE";
  }

  return "PRESENT";
}

export function getAttendanceDateRecord(checkInAt: Date = new Date()): Date {
  return getColomboDayStart(checkInAt);
}
