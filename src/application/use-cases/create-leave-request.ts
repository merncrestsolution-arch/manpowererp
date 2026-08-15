import { prisma } from "@/infrastructure/db/prisma";

import type { CreateLeaveRequestInput } from "@/application/dto/leave-request.schema";
import type { LeaveRequestItem } from "@/types/employee";

function mapLeaveRequest(leave: {
  id: string;
  type: LeaveRequestItem["type"];
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveRequestItem["status"];
  approvedAt: Date | null;
  createdAt: Date;
  approvedBy: { name: string } | null;
}): LeaveRequestItem {
  return {
    id: leave.id,
    type: leave.type,
    startDate: leave.startDate.toISOString(),
    endDate: leave.endDate.toISOString(),
    reason: leave.reason,
    status: leave.status,
    approvedByName: leave.approvedBy?.name ?? null,
    approvedAt: leave.approvedAt?.toISOString() ?? null,
    createdAt: leave.createdAt.toISOString(),
  };
}

export async function listEmployeeLeaveRequests(
  branchId: string,
  employeeId: string,
): Promise<LeaveRequestItem[]> {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, branchId },
    select: { id: true },
  });

  if (!employee) {
    return [];
  }

  const leaves = await prisma.leaveRequest.findMany({
    where: { employeeId, deletedAt: null },
    include: { approvedBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return leaves.map(mapLeaveRequest);
}

type CreateLeaveRequestParams = {
  branchId: string;
  employeeId: string;
  userId: string;
  input: CreateLeaveRequestInput;
};

export async function createLeaveRequest({
  branchId,
  employeeId,
  userId,
  input,
}: CreateLeaveRequestParams): Promise<
  { success: true; leave: LeaveRequestItem } | { success: false; error: string }
> {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, branchId, deletedAt: null },
  });

  if (!employee) {
    return { success: false, error: "Employee not found" };
  }

  const leave = await prisma.leaveRequest.create({
    data: {
      employeeId,
      type: input.type,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      reason: input.reason,
      createdBy: userId,
      updatedBy: userId,
    },
    include: { approvedBy: { select: { name: true } } },
  });

  return { success: true, leave: mapLeaveRequest(leave) };
}
