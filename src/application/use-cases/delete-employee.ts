import { prisma } from "@/infrastructure/db/prisma";

type DeleteEmployeeParams = {
  branchId: string;
  employeeId: string;
  userId: string;
};

type DeleteEmployeeResult =
  { success: true } | { success: false; error: string };

export async function deleteEmployee({
  branchId,
  employeeId,
  userId,
}: DeleteEmployeeParams): Promise<DeleteEmployeeResult> {
  const existing = await prisma.employee.findFirst({
    where: { id: employeeId, branchId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Employee not found" };
  }

  await prisma.employee.update({
    where: { id: employeeId },
    data: {
      deletedAt: new Date(),
      updatedBy: userId,
    },
  });

  return { success: true };
}

type RestoreEmployeeParams = {
  branchId: string;
  employeeId: string;
  userId: string;
};

export async function restoreEmployee({
  branchId,
  employeeId,
  userId,
}: RestoreEmployeeParams): Promise<DeleteEmployeeResult> {
  const existing = await prisma.employee.findFirst({
    where: { id: employeeId, branchId, deletedAt: { not: null } },
  });

  if (!existing) {
    return { success: false, error: "Deleted employee not found" };
  }

  await prisma.employee.update({
    where: { id: employeeId },
    data: {
      deletedAt: null,
      updatedBy: userId,
    },
  });

  return { success: true };
}
