import type { EmployeeDetail, EmployeeListItem } from "@/types/employee";
import type { Employee, Prisma } from "@prisma/client";

export function mapEmployeeToListItem(employee: Employee): EmployeeListItem {
  return {
    id: employee.id,
    employeeNo: employee.employeeNo,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone,
    department: employee.department,
    designation: employee.designation,
    employmentType: employee.employmentType,
    status: employee.status,
    joinedAt: employee.joinedAt?.toISOString() ?? null,
    deletedAt: employee.deletedAt?.toISOString() ?? null,
  };
}

export function mapEmployeeToDetail(employee: Employee): EmployeeDetail {
  return {
    id: employee.id,
    employeeNo: employee.employeeNo,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone,
    nic: employee.nic,
    dateOfBirth: employee.dateOfBirth?.toISOString() ?? null,
    gender: employee.gender,
    address: employee.address,
    department: employee.department,
    designation: employee.designation,
    employmentType: employee.employmentType,
    status: employee.status,
    joinedAt: employee.joinedAt?.toISOString() ?? null,
    basicSalary: employee.basicSalary ? Number(employee.basicSalary) : null,
    createdAt: employee.createdAt.toISOString(),
    updatedAt: employee.updatedAt.toISOString(),
    createdBy: employee.createdBy,
    updatedBy: employee.updatedBy,
    deletedAt: employee.deletedAt?.toISOString() ?? null,
  };
}

export function parseOptionalDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function buildEmployeeSearchFilter(
  search?: string,
): Prisma.EmployeeWhereInput | undefined {
  if (!search) {
    return undefined;
  }

  const term = search.trim();
  if (!term) {
    return undefined;
  }

  return {
    OR: [
      { firstName: { contains: term, mode: "insensitive" } },
      { lastName: { contains: term, mode: "insensitive" } },
      { employeeNo: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { nic: { contains: term, mode: "insensitive" } },
    ],
  };
}
