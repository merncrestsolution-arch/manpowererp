import { endOfDay, startOfDay, subDays } from "date-fns";

export function parseReportDate(value: string): Date | null {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getReportDateRange(dateFrom: string, dateTo: string) {
  const from = parseReportDate(dateFrom);
  const to = parseReportDate(dateTo);

  if (!from || !to) {
    return null;
  }

  return {
    from: startOfDay(from),
    to: endOfDay(to),
  };
}

export function getPreviousPeriodRange(from: Date, to: Date) {
  const durationMs = to.getTime() - from.getTime();
  const previousTo = subDays(from, 1);
  const previousFrom = new Date(previousTo.getTime() - durationMs);

  return {
    from: startOfDay(previousFrom),
    to: endOfDay(previousTo),
  };
}

export function formatPeriodLabel(dateFrom: string, dateTo: string): string {
  return `${dateFrom} to ${dateTo}`;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultMonthDateRange(referenceDate = new Date()) {
  const from = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    1,
  );
  const to = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    0,
  );

  return {
    dateFrom: formatLocalDate(from),
    dateTo: formatLocalDate(to),
  };
}

export function getTodayDateString(referenceDate = new Date()) {
  return formatLocalDate(referenceDate);
}
