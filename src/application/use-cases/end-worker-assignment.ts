import { mapClientWorkerAssignment } from "@/application/mappers/client-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { EndWorkerAssignmentInput } from "@/application/dto/client-worker-assignment.schema";
import type { ClientWorkerAssignmentItem } from "@/types/client";

type EndWorkerAssignmentParams = {
  branchId: string;
  clientId: string;
  userId: string;
  input: EndWorkerAssignmentInput;
};

type EndAssignmentResult =
  | { success: true; assignment: ClientWorkerAssignmentItem }
  | { success: false; error: string };

export async function endWorkerAssignment({
  branchId,
  clientId,
  userId,
  input,
}: EndWorkerAssignmentParams): Promise<EndAssignmentResult> {
  const client = await prisma.client.findFirst({
    where: { id: clientId, branchId, deletedAt: null },
    select: { id: true },
  });

  if (!client) {
    return { success: false, error: "Client not found" };
  }

  const existing = await prisma.clientWorkerAssignment.findFirst({
    where: {
      id: input.assignmentId,
      clientId,
      deletedAt: null,
      status: "ACTIVE",
    },
  });

  if (!existing) {
    return { success: false, error: "Active assignment not found" };
  }

  const assignedTo = input.assignedTo ? new Date(input.assignedTo) : new Date();

  if (Number.isNaN(assignedTo.getTime())) {
    return { success: false, error: "Invalid end date" };
  }

  const assignment = await prisma.clientWorkerAssignment.update({
    where: { id: input.assignmentId },
    data: {
      assignedTo,
      status: "ENDED",
      updatedBy: userId,
    },
    include: {
      employee: {
        select: { employeeNo: true, firstName: true, lastName: true },
      },
    },
  });

  return {
    success: true,
    assignment: mapClientWorkerAssignment(assignment),
  };
}
