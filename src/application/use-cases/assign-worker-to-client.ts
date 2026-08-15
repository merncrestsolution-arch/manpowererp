import {
  mapClientWorkerAssignment,
  parseOptionalDate,
} from "@/application/mappers/client-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { AssignWorkerToClientInput } from "@/application/dto/client-worker-assignment.schema";
import type { ClientWorkerAssignmentItem } from "@/types/client";

type AssignWorkerParams = {
  branchId: string;
  clientId: string;
  userId: string;
  input: AssignWorkerToClientInput;
};

type AssignmentResult =
  | { success: true; assignment: ClientWorkerAssignmentItem }
  | { success: false; error: string };

async function assertClientAccess(branchId: string, clientId: string) {
  return prisma.client.findFirst({
    where: { id: clientId, branchId, deletedAt: null },
    select: { id: true },
  });
}

export async function assignWorkerToClient({
  branchId,
  clientId,
  userId,
  input,
}: AssignWorkerParams): Promise<AssignmentResult> {
  const client = await assertClientAccess(branchId, clientId);

  if (!client) {
    return { success: false, error: "Client not found" };
  }

  const employee = await prisma.employee.findFirst({
    where: {
      id: input.employeeId,
      branchId,
      deletedAt: null,
      status: { not: "TERMINATED" },
    },
  });

  if (!employee) {
    return { success: false, error: "Employee not found" };
  }

  const assignedFrom = parseOptionalDate(input.assignedFrom);
  const assignedTo = parseOptionalDate(input.assignedTo);

  if (!assignedFrom) {
    return { success: false, error: "Invalid assignment start date" };
  }

  if (assignedTo && assignedTo < assignedFrom) {
    return { success: false, error: "End date must be after start date" };
  }

  const assignment = await prisma.clientWorkerAssignment.create({
    data: {
      clientId,
      employeeId: input.employeeId,
      assignedFrom,
      assignedTo,
      role: input.role,
      status: assignedTo && assignedTo < new Date() ? "ENDED" : "ACTIVE",
      createdBy: userId,
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

export async function listClientWorkerAssignments(
  branchId: string,
  clientId: string,
): Promise<ClientWorkerAssignmentItem[]> {
  const client = await assertClientAccess(branchId, clientId);

  if (!client) {
    return [];
  }

  const assignments = await prisma.clientWorkerAssignment.findMany({
    where: { clientId, deletedAt: null },
    include: {
      employee: {
        select: { employeeNo: true, firstName: true, lastName: true },
      },
    },
    orderBy: [{ assignedFrom: "desc" }],
  });

  return assignments.map(mapClientWorkerAssignment);
}
