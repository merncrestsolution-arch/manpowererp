import { prisma } from "@/infrastructure/db/prisma";

import type { HeadcountReport } from "@/types/reports";

function groupEmployees(
  employees: {
    department: string | null;
    designation: string | null;
    status: string;
  }[],
  field: "department" | "designation" | "status",
): { label: string; count: number }[] {
  const counts = new Map<string, number>();

  for (const employee of employees) {
    const raw = employee[field];
    const label = raw?.trim() || "Unassigned";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getHeadcountReport(
  branchId: string,
): Promise<HeadcountReport> {
  const employees = await prisma.employee.findMany({
    where: { branchId, deletedAt: null },
    select: { department: true, designation: true, status: true },
  });

  return {
    total: employees.length,
    byDepartment: groupEmployees(employees, "department"),
    byDesignation: groupEmployees(employees, "designation"),
    byStatus: groupEmployees(employees, "status"),
  };
}
