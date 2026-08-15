import { getAttendanceDateRecord } from "@/application/use-cases/attendance-status";
import { calculateOvertimeForAttendance } from "@/application/use-cases/calculate-overtime";
import { validateGpsCheckin } from "@/application/use-cases/validate-gps-checkin";
import { validateQrCheckin } from "@/application/use-cases/validate-qr-checkin";
import { prisma } from "@/infrastructure/db/prisma";
import { getWorkedHours } from "@/lib/date";
import {
  getActiveDeploymentForEmployee,
  resolveEmployeeForUser,
} from "@/lib/employee-context";

import type { CheckOutInput } from "@/application/dto/attendance.schema";
import type { CheckOutResult } from "@/types/attendance";

type CheckOutParams = {
  branchId: string;
  userId: string;
  role: string;
  employeeId?: string;
  input: CheckOutInput;
};

type CheckOutResponse =
  { success: true; result: CheckOutResult } | { success: false; error: string };

export async function checkOut({
  branchId,
  userId,
  role,
  employeeId: requestedEmployeeId,
  input,
}: CheckOutParams): Promise<CheckOutResponse> {
  let employeeId = requestedEmployeeId;

  if (!employeeId) {
    const employee = await resolveEmployeeForUser(branchId, userId);

    if (!employee) {
      return {
        success: false,
        error: "No employee profile linked to your account",
      };
    }

    employeeId = employee.id;
  } else if (role === "EMPLOYEE") {
    const selfEmployee = await resolveEmployeeForUser(branchId, userId);

    if (!selfEmployee || selfEmployee.id !== employeeId) {
      return { success: false, error: "You can only check yourself out" };
    }
  }

  const deployment = await getActiveDeploymentForEmployee(branchId, employeeId);

  if (!deployment?.workLocation) {
    return {
      success: false,
      error: "No active deployment with work location found",
    };
  }

  const now = new Date();
  const attendanceDate = getAttendanceDateRecord(now);

  const existing = await prisma.attendanceRecord.findFirst({
    where: {
      employeeId,
      date: attendanceDate,
      deletedAt: null,
    },
  });

  if (!existing?.checkInAt) {
    return { success: false, error: "You have not checked in today" };
  }

  if (existing.checkOutAt) {
    return { success: false, error: "Already checked out for today" };
  }

  if (input.method === "QR") {
    if (!input.qrCode) {
      return { success: false, error: "QR code is required" };
    }

    const qrValidation = await validateQrCheckin(branchId, input.qrCode);

    if (!qrValidation.success) {
      return { success: false, error: qrValidation.error };
    }

    if (qrValidation.workLocationId !== deployment.workLocation.id) {
      return {
        success: false,
        error: "QR checkpoint does not match your assigned work location",
      };
    }
  }

  let checkOutLat: number | undefined;
  let checkOutLng: number | undefined;

  if (input.method === "GPS") {
    if (input.latitude === undefined || input.longitude === undefined) {
      return { success: false, error: "GPS coordinates are required" };
    }

    const targetLat = deployment.workLocation.geoLat
      ? deployment.workLocation.geoLat.toNumber()
      : null;
    const targetLng = deployment.workLocation.geoLng
      ? deployment.workLocation.geoLng.toNumber()
      : null;

    const gpsValidation = validateGpsCheckin({
      latitude: input.latitude,
      longitude: input.longitude,
      targetLat,
      targetLng,
    });

    if (!gpsValidation.success) {
      return { success: false, error: gpsValidation.error };
    }

    checkOutLat = input.latitude;
    checkOutLng = input.longitude;
  }

  const updated = await prisma.attendanceRecord.update({
    where: { id: existing.id },
    data: {
      checkOutAt: now,
      checkOutMethod: input.method,
      checkOutLat: checkOutLat ?? null,
      checkOutLng: checkOutLng ?? null,
      updatedBy: userId,
    },
  });

  const overtimeResult = await calculateOvertimeForAttendance({
    attendanceRecordId: updated.id,
    userId,
  });

  const workedHours = Number(
    getWorkedHours(existing.checkInAt, now).toFixed(2),
  );

  return {
    success: true,
    result: {
      attendanceId: updated.id,
      checkOutAt: now.toISOString(),
      workedHours,
      overtimeCreated: overtimeResult.created,
    },
  };
}
