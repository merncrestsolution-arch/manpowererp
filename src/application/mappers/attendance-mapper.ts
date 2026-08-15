import { getColomboDateKey, getWorkedHours } from "@/lib/date";

import type { AttendanceListItem, AttendanceDetail } from "@/types/attendance";

type AttendanceRecordWithRelations = {
  id: string;
  employeeId: string;
  deploymentId: string | null;
  date: Date;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  checkInMethod: AttendanceListItem["checkInMethod"];
  checkOutMethod: AttendanceListItem["checkOutMethod"];
  checkInLat: { toNumber(): number } | null;
  checkInLng: { toNumber(): number } | null;
  checkOutLat: { toNumber(): number } | null;
  checkOutLng: { toNumber(): number } | null;
  status: AttendanceListItem["status"];
  manualReason: string | null;
  employee: {
    employeeNo: string;
    firstName: string;
    lastName: string;
  };
  deployment?: {
    workLocation: { name: string } | null;
  } | null;
  enteredBy?: { name: string } | null;
};

function mapWorkedHours(
  checkInAt: Date | null,
  checkOutAt: Date | null,
): number | null {
  if (!checkInAt || !checkOutAt) {
    return null;
  }

  return Number(getWorkedHours(checkInAt, checkOutAt).toFixed(2));
}

export function mapAttendanceToListItem(
  record: AttendanceRecordWithRelations,
): AttendanceListItem {
  return {
    id: record.id,
    employeeId: record.employeeId,
    employeeNo: record.employee.employeeNo,
    employeeName: `${record.employee.firstName} ${record.employee.lastName}`,
    deploymentId: record.deploymentId,
    workLocationName: record.deployment?.workLocation?.name ?? null,
    date: getColomboDateKey(record.date),
    checkInAt: record.checkInAt?.toISOString() ?? null,
    checkOutAt: record.checkOutAt?.toISOString() ?? null,
    checkInMethod: record.checkInMethod,
    checkOutMethod: record.checkOutMethod,
    status: record.status,
    workedHours: mapWorkedHours(record.checkInAt, record.checkOutAt),
  };
}

export function mapAttendanceToDetail(
  record: AttendanceRecordWithRelations,
): AttendanceDetail {
  return {
    ...mapAttendanceToListItem(record),
    checkInLat: record.checkInLat ? record.checkInLat.toNumber() : null,
    checkInLng: record.checkInLng ? record.checkInLng.toNumber() : null,
    checkOutLat: record.checkOutLat ? record.checkOutLat.toNumber() : null,
    checkOutLng: record.checkOutLng ? record.checkOutLng.toNumber() : null,
    manualReason: record.manualReason,
    enteredByName: record.enteredBy?.name ?? null,
  };
}
