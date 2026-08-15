import {
  mapDeploymentToDetail,
  parseOptionalDate,
} from "@/application/mappers/deployment-mapper";
import { prisma } from "@/infrastructure/db/prisma";
import { formatDeploymentNo, getNextSequenceValue } from "@/lib/sequence";

import type { CreateDeploymentInput } from "@/application/dto/deployment.schema";
import type { DeploymentDetail } from "@/types/deployment";

type CreateDeploymentParams = {
  branchId: string;
  userId: string;
  input: CreateDeploymentInput;
};

type CreateDeploymentResult =
  | { success: true; deployment: DeploymentDetail }
  | { success: false; error: string };

function deriveAssignmentStatus(
  startDate: Date,
  endDate: Date | null,
  deploymentStatus: CreateDeploymentInput["status"],
): "ACTIVE" | "ENDED" {
  if (deploymentStatus === "COMPLETED" || deploymentStatus === "CANCELLED") {
    return "ENDED";
  }

  const now = new Date();
  if (endDate && endDate < now) {
    return "ENDED";
  }

  if (startDate > now && deploymentStatus === "SCHEDULED") {
    return "ACTIVE";
  }

  return "ACTIVE";
}

async function assertNoOverlappingDeployment(
  branchId: string,
  employeeId: string,
  startDate: Date,
  endDate: Date | null,
  excludeDeploymentId?: string,
) {
  const overlapping = await prisma.deployment.findFirst({
    where: {
      branchId,
      employeeId,
      deletedAt: null,
      status: { in: ["SCHEDULED", "ACTIVE"] },
      ...(excludeDeploymentId ? { id: { not: excludeDeploymentId } } : {}),
      startDate: { lte: endDate ?? new Date("2099-12-31") },
      OR: [{ endDate: null }, { endDate: { gte: startDate } }],
    },
    select: { deploymentNo: true },
  });

  return overlapping;
}

export async function createDeployment({
  branchId,
  userId,
  input,
}: CreateDeploymentParams): Promise<CreateDeploymentResult> {
  const startDate = parseOptionalDate(input.startDate);
  const endDate = parseOptionalDate(input.endDate);

  if (!startDate) {
    return { success: false, error: "Invalid start date" };
  }

  const [employee, client, workLocation, shift] = await Promise.all([
    prisma.employee.findFirst({
      where: {
        id: input.employeeId,
        branchId,
        deletedAt: null,
        status: { not: "TERMINATED" },
      },
    }),
    prisma.client.findFirst({
      where: { id: input.clientId, branchId, deletedAt: null },
    }),
    prisma.workLocation.findFirst({
      where: {
        id: input.workLocationId,
        deletedAt: null,
        clientId: input.clientId,
        client: { branchId, deletedAt: null },
      },
    }),
    prisma.shift.findFirst({
      where: { id: input.shiftId, branchId, deletedAt: null },
    }),
  ]);

  if (!employee) {
    return { success: false, error: "Employee not found" };
  }
  if (!client) {
    return { success: false, error: "Client not found" };
  }
  if (!workLocation) {
    return { success: false, error: "Work location not found for this client" };
  }
  if (!shift) {
    return { success: false, error: "Shift not found" };
  }

  if (input.contractRefId) {
    const contract = await prisma.clientContract.findFirst({
      where: {
        id: input.contractRefId,
        clientId: input.clientId,
        branchId,
        deletedAt: null,
      },
    });

    if (!contract) {
      return { success: false, error: "Client contract reference not found" };
    }
  }

  const overlap = await assertNoOverlappingDeployment(
    branchId,
    input.employeeId,
    startDate,
    endDate,
  );

  if (overlap) {
    return {
      success: false,
      error: `Employee already has an active deployment (${overlap.deploymentNo})`,
    };
  }

  try {
    const deployment = await prisma.$transaction(async (tx) => {
      const sequenceValue = await getNextSequenceValue(
        tx,
        branchId,
        "deployment_no",
      );
      const deploymentNo = formatDeploymentNo(sequenceValue);

      const assignment = await tx.clientWorkerAssignment.create({
        data: {
          clientId: input.clientId,
          employeeId: input.employeeId,
          assignedFrom: startDate,
          assignedTo: endDate,
          role: input.assignmentRole,
          status: deriveAssignmentStatus(startDate, endDate, input.status),
          createdBy: userId,
          updatedBy: userId,
        },
      });

      const created = await tx.deployment.create({
        data: {
          branchId,
          deploymentNo,
          employeeId: input.employeeId,
          clientId: input.clientId,
          workLocationId: input.workLocationId,
          shiftId: input.shiftId,
          clientWorkerAssignmentId: assignment.id,
          contractRefId: input.contractRefId || null,
          startDate,
          endDate,
          status: input.status,
          createdBy: userId,
          updatedBy: userId,
        },
        include: {
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
          shift: {
            select: { id: true, name: true, startTime: true, endTime: true },
          },
          contractRef: { select: { id: true, title: true } },
          clientWorkerAssignment: { select: { role: true } },
        },
      });

      await tx.employeeShift.updateMany({
        where: {
          employeeId: input.employeeId,
          deletedAt: null,
          effectiveTo: null,
          effectiveFrom: { lte: startDate },
        },
        data: {
          effectiveTo: startDate,
          updatedBy: userId,
        },
      });

      await tx.employeeShift.create({
        data: {
          employeeId: input.employeeId,
          shiftId: input.shiftId,
          effectiveFrom: startDate,
          effectiveTo: endDate,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      return created;
    });

    return { success: true, deployment: mapDeploymentToDetail(deployment) };
  } catch {
    return { success: false, error: "Failed to create deployment" };
  }
}
