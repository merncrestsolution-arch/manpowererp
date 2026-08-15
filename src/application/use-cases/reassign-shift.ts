import { mapDeploymentToDetail } from "@/application/mappers/deployment-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { ReassignShiftInput } from "@/application/dto/deployment.schema";
import type { DeploymentDetail } from "@/types/deployment";

type ReassignShiftParams = {
  branchId: string;
  deploymentId: string;
  userId: string;
  input: ReassignShiftInput;
};

type ReassignShiftResult =
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

export async function reassignShift({
  branchId,
  deploymentId,
  userId,
  input,
}: ReassignShiftParams): Promise<ReassignShiftResult> {
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

  const shift = await prisma.shift.findFirst({
    where: { id: input.shiftId, branchId, deletedAt: null },
  });

  if (!shift) {
    return { success: false, error: "Shift not found" };
  }

  const effectiveFrom = input.effectiveFrom
    ? new Date(input.effectiveFrom)
    : new Date();

  if (Number.isNaN(effectiveFrom.getTime())) {
    return { success: false, error: "Invalid effective date" };
  }

  try {
    const deployment = await prisma.$transaction(async (tx) => {
      await tx.employeeShift.updateMany({
        where: {
          employeeId: existing.employeeId,
          shiftId: existing.shiftId,
          deletedAt: null,
          effectiveTo: null,
        },
        data: {
          effectiveTo: effectiveFrom,
          updatedBy: userId,
        },
      });

      await tx.employeeShift.create({
        data: {
          employeeId: existing.employeeId,
          shiftId: input.shiftId,
          effectiveFrom,
          effectiveTo: existing.endDate,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      return tx.deployment.update({
        where: { id: deploymentId },
        data: {
          shiftId: input.shiftId,
          updatedBy: userId,
        },
        include: deploymentInclude,
      });
    });

    return { success: true, deployment: mapDeploymentToDetail(deployment) };
  } catch {
    return { success: false, error: "Failed to reassign shift" };
  }
}

export async function getShiftCoverage(
  branchId: string,
  workLocationId: string,
) {
  const workLocation = await prisma.workLocation.findFirst({
    where: {
      id: workLocationId,
      deletedAt: null,
      client: { branchId, deletedAt: null },
    },
    select: { id: true, name: true },
  });

  if (!workLocation) {
    return null;
  }

  const deployments = await prisma.deployment.findMany({
    where: {
      workLocationId,
      branchId,
      deletedAt: null,
      status: { in: ["SCHEDULED", "ACTIVE"] },
    },
    include: {
      shift: {
        select: { id: true, name: true, startTime: true, endTime: true },
      },
      employee: {
        select: { employeeNo: true, firstName: true, lastName: true },
      },
    },
    orderBy: [{ shift: { name: "asc" } }, { deploymentNo: "asc" }],
  });

  const { buildShiftCoverageRows } =
    await import("@/application/mappers/deployment-mapper");

  return {
    workLocationId: workLocation.id,
    workLocationName: workLocation.name,
    coverage: buildShiftCoverageRows(deployments),
  };
}
