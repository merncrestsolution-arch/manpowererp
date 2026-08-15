import { prisma } from "@/infrastructure/db/prisma";

import type { UpdateLeaveStatusInput } from "@/application/dto/leave-request.schema";
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

type UpdateLeaveStatusParams = {
  branchId: string;
  employeeId: string;
  leaveId: string;
  approverId: string;
  input: UpdateLeaveStatusInput;
};

export async function updateLeaveStatus({
  branchId,
  employeeId,
  leaveId,
  approverId,
  input,
}: UpdateLeaveStatusParams): Promise<
  { success: true; leave: LeaveRequestItem } | { success: false; error: string }
> {
  const leave = await prisma.leaveRequest.findFirst({
    where: {
      id: leaveId,
      employeeId,
      deletedAt: null,
      employee: { branchId },
    },
  });

  if (!leave) {
    return { success: false, error: "Leave request not found" };
  }

  if (leave.status !== "PENDING") {
    return {
      success: false,
      error: "Leave request has already been processed",
    };
  }

  const updated = await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {
      status: input.status,
      approvedById: approverId,
      approvedAt: new Date(),
      updatedBy: approverId,
    },
    include: { approvedBy: { select: { name: true } } },
  });

  if (input.status === "APPROVED") {
    await prisma.employee.update({
      where: { id: employeeId },
      data: { status: "ON_LEAVE", updatedBy: approverId },
    });
  }

  return { success: true, leave: mapLeaveRequest(updated) };
}
