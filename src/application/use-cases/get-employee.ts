import { mapEmployeeToDetail } from "@/application/mappers/employee-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { EmployeeDetail } from "@/types/employee";

type GetEmployeeParams = {
  branchId: string;
  employeeId: string;
  includeDeleted?: boolean;
};

type GetEmployeeResult =
  | { success: true; employee: EmployeeDetail }
  | { success: false; error: string };

export async function getEmployee({
  branchId,
  employeeId,
  includeDeleted = false,
}: GetEmployeeParams): Promise<GetEmployeeResult> {
  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,
      branchId,
      ...(includeDeleted ? {} : { deletedAt: null }),
    },
  });

  if (!employee) {
    return { success: false, error: "Employee not found" };
  }

  return { success: true, employee: mapEmployeeToDetail(employee) };
}
