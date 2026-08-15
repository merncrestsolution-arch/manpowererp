import { mapSalaryComponentToItem } from "@/application/mappers/payroll-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { ConfigureSalaryComponentInput } from "@/application/dto/salary-component.schema";
import type { SalaryComponentItem } from "@/types/payroll";

type ConfigureSalaryComponentParams = {
  branchId: string;
  userId: string;
  input: ConfigureSalaryComponentInput;
};

type ConfigureSalaryComponentResult =
  | { success: true; component: SalaryComponentItem }
  | { success: false; error: string };

export async function configureSalaryComponent({
  branchId,
  userId,
  input,
}: ConfigureSalaryComponentParams): Promise<ConfigureSalaryComponentResult> {
  if (input.id) {
    const existing = await prisma.salaryComponent.findFirst({
      where: { id: input.id, branchId, deletedAt: null },
    });

    if (!existing) {
      return { success: false, error: "Salary component not found" };
    }

    const component = await prisma.salaryComponent.update({
      where: { id: input.id },
      data: {
        name: input.name,
        type: input.type,
        calculationType: input.calculationType,
        defaultValue: input.defaultValue,
        isTaxable: input.isTaxable,
        isActive: input.isActive,
        updatedBy: userId,
      },
    });

    return { success: true, component: mapSalaryComponentToItem(component) };
  }

  const component = await prisma.salaryComponent.create({
    data: {
      branchId,
      name: input.name,
      type: input.type,
      calculationType: input.calculationType,
      defaultValue: input.defaultValue,
      isTaxable: input.isTaxable,
      isActive: input.isActive,
      createdBy: userId,
      updatedBy: userId,
    },
  });

  return { success: true, component: mapSalaryComponentToItem(component) };
}

export async function listSalaryComponents({
  branchId,
  query,
}: {
  branchId: string;
  query: { type?: "ALLOWANCE" | "DEDUCTION"; includeInactive?: boolean };
}): Promise<SalaryComponentItem[]> {
  const components = await prisma.salaryComponent.findMany({
    where: {
      branchId,
      deletedAt: null,
      ...(query.type ? { type: query.type } : {}),
      ...(query.includeInactive ? {} : { isActive: true }),
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return components.map(mapSalaryComponentToItem);
}

export async function deleteSalaryComponent({
  branchId,
  componentId,
  userId,
}: {
  branchId: string;
  componentId: string;
  userId: string;
}): Promise<{ success: boolean; error?: string }> {
  const existing = await prisma.salaryComponent.findFirst({
    where: { id: componentId, branchId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Salary component not found" };
  }

  await prisma.salaryComponent.update({
    where: { id: componentId },
    data: { deletedAt: new Date(), isActive: false, updatedBy: userId },
  });

  return { success: true };
}
