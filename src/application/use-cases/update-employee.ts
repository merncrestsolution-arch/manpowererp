import {
  mapEmployeeToDetail,
  parseOptionalDate,
} from "@/application/mappers/employee-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { UpdateEmployeeInput } from "@/application/dto/employee.schema";
import type { EmployeeDetail } from "@/types/employee";

type UpdateEmployeeParams = {
  branchId: string;
  employeeId: string;
  userId: string;
  input: UpdateEmployeeInput;
};

type UpdateEmployeeResult =
  | { success: true; employee: EmployeeDetail }
  | { success: false; error: string };

export async function updateEmployee({
  branchId,
  employeeId,
  userId,
  input,
}: UpdateEmployeeParams): Promise<UpdateEmployeeResult> {
  const existing = await prisma.employee.findFirst({
    where: { id: employeeId, branchId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Employee not found" };
  }

  try {
    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email === "" ? null : input.email,
        phone: input.phone === "" ? null : input.phone,
        nic: input.nic === "" ? null : input.nic,
        dateOfBirth:
          input.dateOfBirth !== undefined
            ? parseOptionalDate(input.dateOfBirth)
            : undefined,
        gender: input.gender,
        address: input.address === "" ? null : input.address,
        department: input.department === "" ? null : input.department,
        designation: input.designation === "" ? null : input.designation,
        employmentType: input.employmentType,
        status: input.status,
        joinedAt:
          input.joinedAt !== undefined
            ? parseOptionalDate(input.joinedAt)
            : undefined,
        basicSalary: input.basicSalary,
        updatedBy: userId,
      },
    });

    return { success: true, employee: mapEmployeeToDetail(employee) };
  } catch {
    return { success: false, error: "Failed to update employee" };
  }
}
