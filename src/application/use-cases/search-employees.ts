import { buildEmployeeSearchFilter } from "@/application/mappers/employee-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { EmployeeSearchResult } from "@/types/client";

export async function searchEmployees({
  branchId,
  query,
  limit = 10,
}: {
  branchId: string;
  query: string;
  limit?: number;
}): Promise<EmployeeSearchResult[]> {
  const term = query.trim();

  if (!term) {
    return [];
  }

  const employees = await prisma.employee.findMany({
    where: {
      branchId,
      deletedAt: null,
      status: { not: "TERMINATED" },
      ...buildEmployeeSearchFilter(term),
    },
    select: {
      id: true,
      employeeNo: true,
      firstName: true,
      lastName: true,
      designation: true,
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    take: limit,
  });

  return employees;
}
