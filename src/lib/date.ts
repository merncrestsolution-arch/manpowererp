import { addDays, endOfDay, startOfDay } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

const COLOMBO_TIMEZONE = "Asia/Colombo";

export function toUTC(date: Date): Date {
  return fromZonedTime(date, COLOMBO_TIMEZONE);
}

export function toColomboTime(date: Date): Date {
  return toZonedTime(date, COLOMBO_TIMEZONE);
}

export function formatColomboDate(
  date: Date,
  formatString = "dd MMM yyyy, hh:mm a",
): string {
  return formatInTimeZone(date, COLOMBO_TIMEZONE, formatString);
}

export function getColomboDateKey(date: Date = new Date()): string {
  return formatInTimeZone(date, COLOMBO_TIMEZONE, "yyyy-MM-dd");
}

export function getColomboDayStart(date: Date = new Date()): Date {
  const dateKey = getColomboDateKey(date);
  return fromZonedTime(`${dateKey}T00:00:00`, COLOMBO_TIMEZONE);
}

export function getColomboDayEnd(date: Date = new Date()): Date {
  const dateKey = getColomboDateKey(date);
  return fromZonedTime(`${dateKey}T23:59:59.999`, COLOMBO_TIMEZONE);
}

export function parseColomboDateKey(dateKey: string): Date {
  return fromZonedTime(`${dateKey}T00:00:00`, COLOMBO_TIMEZONE);
}

export function getColomboWeekRange(date: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const colomboDate = toColomboTime(date);
  const dayOfWeek = colomboDate.getDay();
  const weekStart = startOfDay(addDays(colomboDate, -dayOfWeek));
  const weekEnd = endOfDay(addDays(weekStart, 6));

  return {
    start: fromZonedTime(weekStart, COLOMBO_TIMEZONE),
    end: fromZonedTime(weekEnd, COLOMBO_TIMEZONE),
  };
}

export function getColomboMonthRange(date: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const year = Number(formatInTimeZone(date, COLOMBO_TIMEZONE, "yyyy"));
  const month = Number(formatInTimeZone(date, COLOMBO_TIMEZONE, "MM"));
  const startKey = `${year}-${String(month).padStart(2, "0")}-01`;
  const start = fromZonedTime(`${startKey}T00:00:00`, COLOMBO_TIMEZONE);
  const nextMonth =
    month === 12
      ? fromZonedTime(`${year + 1}-01-01T00:00:00`, COLOMBO_TIMEZONE)
      : fromZonedTime(
          `${year}-${String(month + 1).padStart(2, "0")}-01T00:00:00`,
          COLOMBO_TIMEZONE,
        );
  const end = new Date(nextMonth.getTime() - 1);

  return { start, end };
}

export function parseShiftTimeOnDate(dateKey: string, timeValue: string): Date {
  return fromZonedTime(`${dateKey}T${timeValue}:00`, COLOMBO_TIMEZONE);
}

export function getWorkedHours(checkInAt: Date, checkOutAt: Date): number {
  const diffMs = checkOutAt.getTime() - checkInAt.getTime();
  return Math.max(0, diffMs / (1000 * 60 * 60));
}

export function getShiftDurationHours(
  startTime: string,
  endTime: string,
): number {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const startMinutes = startHour * 60 + startMinute;
  let endMinutes = endHour * 60 + endMinute;

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  return (endMinutes - startMinutes) / 60;
}
