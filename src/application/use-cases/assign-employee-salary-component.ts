import { mapEmployeeSalaryComponentToItem } from "@/application/mappers/payroll-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { AssignEmployeeSalaryComponentInput } from "@/application/dto/employee-salary-component.schema";
import type { EmployeeSalaryComponentItem } from "@/types/payroll";

type AssignEmployeeSalaryComponentParams = {
  branchId: string;
  employeeId: string;
  userId: string;
  input: AssignEmployeeSalaryComponentInput;
};

type AssignEmployeeSalaryComponentResult =
  | { success: true; assignment: EmployeeSalaryComponentItem }
  | { success: false; error: string };

export async function assignEmployeeSalaryComponent({
  branchId,
  employeeId,
  userId,
  input,
}: AssignEmployeeSalaryComponentParams): Promise<AssignEmployeeSalaryComponentResult> {
  const [employee, component] = await Promise.all([
    prisma.employee.findFirst({
      where: { id: employeeId, branchId, deletedAt: null },
    }),
    prisma.salaryComponent.findFirst({
      where: {
        id: input.salaryComponentId,
        branchId,
        deletedAt: null,
        isActive: true,
      },
    }),
  ]);

  if (!employee) {
    return { success: false, error: "Employee not found" };
  }
  if (!component) {
    return { success: false, error: "Salary component not found" };
  }

  const effectiveFrom = new Date(input.effectiveFrom);
  const effectiveTo = input.effectiveTo ? new Date(input.effectiveTo) : null;

  if (effectiveTo && effectiveTo < effectiveFrom) {
    return {
      success: false,
      error: "Effective to must be after effective from",
    };
  }

  const assignment = await prisma.employeeSalaryComponent.create({
    data: {
      employeeId,
      salaryComponentId: input.salaryComponentId,
      value: input.value ?? null,
      effectiveFrom,
      effectiveTo,
      createdBy: userId,
      updatedBy: userId,
    },
    include: {
      salaryComponent: {
        select: { name: true, type: true, calculationType: true },
      },
    },
  });

  return {
    success: true,
    assignment: mapEmployeeSalaryComponentToItem(assignment),
  };
}

export async function listEmployeeSalaryComponents(
  branchId: string,
  employeeId: string,
): Promise<EmployeeSalaryComponentItem[]> {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, branchId, deletedAt: null },
    select: { id: true },
  });

  if (!employee) {
    return [];
  }

  const assignments = await prisma.employeeSalaryComponent.findMany({
    where: { employeeId, deletedAt: null },
    include: {
      salaryComponent: {
        select: { name: true, type: true, calculationType: true },
      },
    },
    orderBy: { effectiveFrom: "desc" },
  });

  return assignments.map(mapEmployeeSalaryComponentToItem);
}
