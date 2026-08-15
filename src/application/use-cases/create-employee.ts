import {
  mapEmployeeToDetail,
  parseOptionalDate,
} from "@/application/mappers/employee-mapper";
import { prisma } from "@/infrastructure/db/prisma";
import { formatEmployeeNo, getNextSequenceValue } from "@/lib/sequence";

import type { CreateEmployeeInput } from "@/application/dto/employee.schema";
import type { EmployeeDetail } from "@/types/employee";

type CreateEmployeeParams = {
  branchId: string;
  userId: string;
  input: CreateEmployeeInput;
};

type CreateEmployeeResult =
  | { success: true; employee: EmployeeDetail }
  | { success: false; error: string };

export async function createEmployee({
  branchId,
  userId,
  input,
}: CreateEmployeeParams): Promise<CreateEmployeeResult> {
  try {
    const employee = await prisma.$transaction(async (tx) => {
      const sequenceValue = await getNextSequenceValue(
        tx,
        branchId,
        "employee_no",
      );
      const employeeNo = formatEmployeeNo(sequenceValue);

      return tx.employee.create({
        data: {
          branchId,
          employeeNo,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email || null,
          phone: input.phone || null,
          nic: input.nic || null,
          dateOfBirth: parseOptionalDate(input.dateOfBirth),
          gender: input.gender ?? null,
          address: input.address || null,
          department: input.department || null,
          designation: input.designation || null,
          employmentType: input.employmentType,
          status: input.status,
          joinedAt: parseOptionalDate(input.joinedAt),
          basicSalary: input.basicSalary ?? null,
          createdBy: userId,
          updatedBy: userId,
        },
      });
    });

    return { success: true, employee: mapEmployeeToDetail(employee) };
  } catch {
    return { success: false, error: "Failed to create employee" };
  }
}
