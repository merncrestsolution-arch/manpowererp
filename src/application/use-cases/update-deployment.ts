import {
  mapDeploymentToDetail,
  parseOptionalDate,
} from "@/application/mappers/deployment-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { UpdateDeploymentInput } from "@/application/dto/deployment.schema";
import type { DeploymentDetail } from "@/types/deployment";

type UpdateDeploymentParams = {
  branchId: string;
  deploymentId: string;
  userId: string;
  input: UpdateDeploymentInput;
};

type UpdateDeploymentResult =
  | { success: true; deployment: DeploymentDetail }
  | { success: false; error: string };

const deploymentInclude = {
  employee: {
    select: {
      id: true,
      employeeNo: true,
      firstName: true,
      lastName: true,
      department: true,
      designation: true,
    },
  },
  client: { select: { id: true, clientNo: true, companyName: true } },
  workLocation: { select: { id: true, name: true } },
  shift: { select: { id: true, name: true, startTime: true, endTime: true } },
  contractRef: { select: { id: true, title: true } },
  clientWorkerAssignment: { select: { role: true } },
} as const;

export async function updateDeployment({
  branchId,
  deploymentId,
  userId,
  input,
}: UpdateDeploymentParams): Promise<UpdateDeploymentResult> {
  const existing = await prisma.deployment.findFirst({
    where: { id: deploymentId, branchId, deletedAt: null },
    include: { clientWorkerAssignment: true },
  });

  if (!existing) {
    return { success: false, error: "Deployment not found" };
  }

  if (existing.status === "COMPLETED" || existing.status === "CANCELLED") {
    return { success: false, error: "Cannot update a closed deployment" };
  }

  const startDate = input.startDate
    ? parseOptionalDate(input.startDate)
    : existing.startDate;
  const endDate =
    input.endDate !== undefined
      ? parseOptionalDate(input.endDate)
      : existing.endDate;

  if (!startDate) {
    return { success: false, error: "Invalid start date" };
  }

  if (input.workLocationId && input.clientId) {
    const workLocation = await prisma.workLocation.findFirst({
      where: {
        id: input.workLocationId,
        clientId: input.clientId,
        deletedAt: null,
      },
    });

    if (!workLocation) {
      return {
        success: false,
        error: "Work location not found for this client",
      };
    }
  }

  try {
    const deployment = await prisma.$transaction(async (tx) => {
      if (existing.clientWorkerAssignmentId) {
        await tx.clientWorkerAssignment.update({
          where: { id: existing.clientWorkerAssignmentId },
          data: {
            ...(input.clientId ? { clientId: input.clientId } : {}),
            ...(input.employeeId ? { employeeId: input.employeeId } : {}),
            assignedFrom: startDate,
            assignedTo: endDate,
            ...(input.assignmentRole ? { role: input.assignmentRole } : {}),
            updatedBy: userId,
          },
        });
      }

      return tx.deployment.update({
        where: { id: deploymentId },
        data: {
          ...(input.employeeId ? { employeeId: input.employeeId } : {}),
          ...(input.clientId ? { clientId: input.clientId } : {}),
          ...(input.workLocationId
            ? { workLocationId: input.workLocationId }
            : {}),
          ...(input.shiftId ? { shiftId: input.shiftId } : {}),
          ...(input.contractRefId !== undefined
            ? { contractRefId: input.contractRefId || null }
            : {}),
          startDate,
          endDate,
          ...(input.status ? { status: input.status } : {}),
          updatedBy: userId,
        },
        include: deploymentInclude,
      });
    });

    return { success: true, deployment: mapDeploymentToDetail(deployment) };
  } catch {
    return { success: false, error: "Failed to update deployment" };
  }
}

export async function getDeployment(
  branchId: string,
  deploymentId: string,
): Promise<DeploymentDetail | null> {
  const deployment = await prisma.deployment.findFirst({
    where: { id: deploymentId, branchId, deletedAt: null },
    include: deploymentInclude,
  });

  return deployment ? mapDeploymentToDetail(deployment) : null;
}

export async function softDeleteDeployment(
  branchId: string,
  deploymentId: string,
  userId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const existing = await prisma.deployment.findFirst({
    where: { id: deploymentId, branchId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Deployment not found" };
  }

  await prisma.deployment.update({
    where: { id: deploymentId },
    data: { deletedAt: new Date(), updatedBy: userId },
  });

  return { success: true };
}

export async function restoreDeployment(
  branchId: string,
  deploymentId: string,
  userId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const existing = await prisma.deployment.findFirst({
    where: { id: deploymentId, branchId },
  });

  if (!existing) {
    return { success: false, error: "Deployment not found" };
  }

  await prisma.deployment.update({
    where: { id: deploymentId },
    data: { deletedAt: null, updatedBy: userId },
  });

  return { success: true };
}
