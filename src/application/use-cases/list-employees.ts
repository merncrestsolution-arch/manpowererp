import {
  buildEmployeeSearchFilter,
  mapEmployeeToListItem,
} from "@/application/mappers/employee-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { ListEmployeesQuery } from "@/application/dto/employee.schema";
import type {
  EmployeeFilterOptions,
  PaginatedResult,
  EmployeeListItem,
} from "@/types/employee";

type ListEmployeesParams = {
  branchId: string;
  query: ListEmployeesQuery;
};

export async function listEmployees({
  branchId,
  query,
}: ListEmployeesParams): Promise<PaginatedResult<EmployeeListItem>> {
  const {
    page,
    pageSize,
    search,
    department,
    designation,
    employmentType,
    status,
    includeDeleted,
    sortBy,
    sortOrder,
  } = query;

  const where = {
    branchId,
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(department ? { department } : {}),
    ...(designation ? { designation } : {}),
    ...(employmentType ? { employmentType } : {}),
    ...(status ? { status } : {}),
    ...buildEmployeeSearchFilter(search),
  };

  const [total, employees] = await Promise.all([
    prisma.employee.count({ where }),
    prisma.employee.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: employees.map(mapEmployeeToListItem),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getEmployeeFilterOptions(
  branchId: string,
): Promise<EmployeeFilterOptions> {
  const [departments, designations] = await Promise.all([
    prisma.employee.findMany({
      where: { branchId, deletedAt: null, department: { not: null } },
      select: { department: true },
      distinct: ["department"],
      orderBy: { department: "asc" },
    }),
    prisma.employee.findMany({
      where: { branchId, deletedAt: null, designation: { not: null } },
      select: { designation: true },
      distinct: ["designation"],
      orderBy: { designation: "asc" },
    }),
  ]);

  return {
    departments: departments
      .map((item) => item.department)
      .filter((value): value is string => Boolean(value)),
    designations: designations
      .map((item) => item.designation)
      .filter((value): value is string => Boolean(value)),
  };
}
