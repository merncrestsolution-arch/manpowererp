import {
  getBearerToken,
  verifyMobileToken,
} from "@/infrastructure/auth/mobile-token";
import {
  getActiveDeploymentForEmployee,
  resolveEmployeeForUser,
} from "@/lib/employee-context";
import { resolveBranchIdForUser } from "@/lib/sequence";

import type { Role } from "@prisma/client";

export type MobileAuthenticatedContext = {
  userId: string;
  role: Role;
  branchId: string;
};

export type MobileEmployeeContext = MobileAuthenticatedContext & {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

export async function getMobileAuthenticatedContext(
  request: Request,
): Promise<MobileAuthenticatedContext | null> {
  const token = getBearerToken(request);

  if (!token) {
    return null;
  }

  const payload = await verifyMobileToken(token);

  if (!payload) {
    return null;
  }

  const branchId = await resolveBranchIdForUser(payload.userId);

  if (!branchId) {
    return null;
  }

  return {
    userId: payload.userId,
    role: payload.role,
    branchId,
  };
}

export async function requireMobileEmployee(
  request: Request,
): Promise<MobileEmployeeContext | null> {
  const context = await getMobileAuthenticatedContext(request);

  if (!context) {
    return null;
  }

  const employee = await resolveEmployeeForUser(
    context.branchId,
    context.userId,
  );

  if (!employee) {
    return null;
  }

  return { ...context, employee };
}

export async function getMobileProfile(request: Request) {
  const context = await getMobileAuthenticatedContext(request);

  if (!context) {
    return null;
  }

  const employee = await resolveEmployeeForUser(
    context.branchId,
    context.userId,
  );
  const deployment = employee
    ? await getActiveDeploymentForEmployee(context.branchId, employee.id)
    : null;

  const token = getBearerToken(request);
  const payload = token ? await verifyMobileToken(token) : null;

  return {
    userId: context.userId,
    email: payload?.email ?? "",
    name: payload?.name ?? "",
    role: context.role,
    branchId: context.branchId,
    employee: employee
      ? {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
        }
      : null,
    deployment: deployment
      ? {
          id: deployment.id,
          workLocation: deployment.workLocation
            ? {
                id: deployment.workLocation.id,
                name: deployment.workLocation.name,
                geoLat: deployment.workLocation.geoLat,
                geoLng: deployment.workLocation.geoLng,
              }
            : null,
          shift: deployment.shift
            ? {
                id: deployment.shift.id,
                name: deployment.shift.name,
                startTime: deployment.shift.startTime,
                endTime: deployment.shift.endTime,
              }
            : null,
        }
      : null,
  };
}
