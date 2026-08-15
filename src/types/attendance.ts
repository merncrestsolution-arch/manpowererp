import type {
  AttendanceCheckMethod,
  AttendanceStatus,
  OvertimeStatus,
} from "@prisma/client";

export type AttendanceListItem = {
  id: string;
  employeeId: string;
  employeeNo: string;
  employeeName: string;
  deploymentId: string | null;
  workLocationName: string | null;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  checkInMethod: AttendanceCheckMethod | null;
  checkOutMethod: AttendanceCheckMethod | null;
  status: AttendanceStatus;
  workedHours: number | null;
};

export type AttendanceDetail = AttendanceListItem & {
  checkInLat: number | null;
  checkInLng: number | null;
  checkOutLat: number | null;
  checkOutLng: number | null;
  manualReason: string | null;
  enteredByName: string | null;
};

export type TimesheetDayEntry = {
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  status: AttendanceStatus;
  workedHours: number | null;
  overtimeHours: number | null;
};

export type EmployeeTimesheet = {
  employeeId: string;
  employeeNo: string;
  employeeName: string;
  periodStart: string;
  periodEnd: string;
  totalWorkedHours: number;
  totalOvertimeHours: number;
  days: TimesheetDayEntry[];
};

export type OvertimeListItem = {
  id: string;
  attendanceRecordId: string;
  employeeId: string;
  employeeNo: string;
  employeeName: string;
  date: string;
  hours: number;
  rateMultiplier: number;
  status: OvertimeStatus;
  approvedByName: string | null;
  createdAt: string;
};

export type QrCheckpointItem = {
  id: string;
  workLocationId: string;
  workLocationName: string;
  clientName: string;
  code: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  qrDataUrl: string | null;
};

export type CheckInResult = {
  attendanceId: string;
  checkInAt: string;
  status: AttendanceStatus;
  workLocationName: string | null;
};

export type CheckOutResult = {
  attendanceId: string;
  checkOutAt: string;
  workedHours: number;
  overtimeCreated: boolean;
};

export type AttendanceFilterOptions = {
  statuses: AttendanceStatus[];
};

export type PaginatedAttendanceResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
