import { mapAttendanceToDetail } from "@/application/mappers/attendance-mapper";
import {
  determineAttendanceStatus,
  getAttendanceDateRecord,
} from "@/application/use-cases/attendance-status";
import { validateGpsCheckin } from "@/application/use-cases/validate-gps-checkin";
import { validateQrCheckin } from "@/application/use-cases/validate-qr-checkin";
import { prisma } from "@/infrastructure/db/prisma";
import {
  getActiveDeploymentForEmployee,
  resolveEmployeeForUser,
} from "@/lib/employee-context";

import type { CheckInInput } from "@/application/dto/attendance.schema";
import type { CheckInResult } from "@/types/attendance";

type CheckInParams = {
  branchId: string;
  userId: string;
  role: string;
  employeeId?: string;
  input: CheckInInput;
};

type CheckInResponse =
  { success: true; result: CheckInResult } | { success: false; error: string };

export async function checkIn({
  branchId,
  userId,
  role,
  employeeId: requestedEmployeeId,
  input,
}: CheckInParams): Promise<CheckInResponse> {
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
      return { success: false, error: "You can only check yourself in" };
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

  if (existing?.checkInAt) {
    return { success: false, error: "Already checked in for today" };
  }

  let latitude: number | undefined;
  let longitude: number | undefined;

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

    latitude = input.latitude;
    longitude = input.longitude;
  }

  const status = determineAttendanceStatus(now, deployment.shift.startTime);

  const record = await prisma.attendanceRecord.upsert({
    where: {
      employeeId_date: {
        employeeId,
        date: attendanceDate,
      },
    },
    create: {
      employeeId,
      deploymentId: deployment.id,
      date: attendanceDate,
      checkInAt: now,
      checkInMethod: input.method,
      checkInLat: latitude ?? null,
      checkInLng: longitude ?? null,
      status,
      createdBy: userId,
      updatedBy: userId,
    },
    update: {
      deploymentId: deployment.id,
      checkInAt: now,
      checkInMethod: input.method,
      checkInLat: latitude ?? null,
      checkInLng: longitude ?? null,
      status,
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
    },
  });

  const mapped = mapAttendanceToDetail(record);

  return {
    success: true,
    result: {
      attendanceId: mapped.id,
      checkInAt: mapped.checkInAt!,
      status: mapped.status,
      workLocationName: mapped.workLocationName,
    },
  };
}
