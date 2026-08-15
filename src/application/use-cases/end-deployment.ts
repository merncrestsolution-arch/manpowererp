import { mapDeploymentToDetail } from "@/application/mappers/deployment-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { EndDeploymentInput } from "@/application/dto/deployment.schema";
import type { DeploymentDetail } from "@/types/deployment";

type EndDeploymentParams = {
  branchId: string;
  deploymentId: string;
  userId: string;
  input: EndDeploymentInput;
};

type EndDeploymentResult =
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

export async function endDeployment({
  branchId,
  deploymentId,
  userId,
  input,
}: EndDeploymentParams): Promise<EndDeploymentResult> {
  const existing = await prisma.deployment.findFirst({
    where: {
      id: deploymentId,
      branchId,
      deletedAt: null,
      status: { in: ["SCHEDULED", "ACTIVE"] },
    },
  });

  if (!existing) {
    return { success: false, error: "Active deployment not found" };
  }

  const endDate = input.endDate ? new Date(input.endDate) : new Date();

  if (Number.isNaN(endDate.getTime())) {
    return { success: false, error: "Invalid end date" };
  }

  if (endDate < existing.startDate) {
    return { success: false, error: "End date cannot be before start date" };
  }

  try {
    const deployment = await prisma.$transaction(async (tx) => {
      if (existing.clientWorkerAssignmentId) {
        await tx.clientWorkerAssignment.update({
          where: { id: existing.clientWorkerAssignmentId },
          data: {
            assignedTo: endDate,
            status: "ENDED",
            updatedBy: userId,
          },
        });
      }

      await tx.employeeShift.updateMany({
        where: {
          employeeId: existing.employeeId,
          shiftId: existing.shiftId,
          deletedAt: null,
          effectiveTo: null,
        },
        data: {
          effectiveTo: endDate,
          updatedBy: userId,
        },
      });

      return tx.deployment.update({
        where: { id: deploymentId },
        data: {
          endDate,
          status: "COMPLETED",
          updatedBy: userId,
        },
        include: deploymentInclude,
      });
    });

    return { success: true, deployment: mapDeploymentToDetail(deployment) };
  } catch {
    return { success: false, error: "Failed to end deployment" };
  }
}
