import {
  buildDeploymentSearchFilter,
  mapDeploymentToListItem,
} from "@/application/mappers/deployment-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { ListDeploymentsQuery } from "@/application/dto/deployment.schema";
import type {
  DeploymentFilterOptions,
  PaginatedResult,
  DeploymentListItem,
} from "@/types/deployment";

type ListDeploymentsParams = {
  branchId: string;
  query: ListDeploymentsQuery;
};

const listInclude = {
  employee: {
    select: { id: true, employeeNo: true, firstName: true, lastName: true },
  },
  client: { select: { id: true, companyName: true } },
  workLocation: { select: { name: true } },
  shift: { select: { name: true } },
} as const;

export async function listDeployments({
  branchId,
  query,
}: ListDeploymentsParams): Promise<PaginatedResult<DeploymentListItem>> {
  const {
    page,
    pageSize,
    search,
    clientId,
    status,
    includeDeleted,
    sortBy,
    sortOrder,
  } = query;

  const where = {
    branchId,
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(clientId ? { clientId } : {}),
    ...(status ? { status } : {}),
    ...buildDeploymentSearchFilter(search),
  };

  const [total, deployments] = await Promise.all([
    prisma.deployment.count({ where }),
    prisma.deployment.findMany({
      where,
      include: listInclude,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: deployments.map(mapDeploymentToListItem),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getDeploymentFilterOptions(
  branchId: string,
): Promise<DeploymentFilterOptions> {
  const [clients, departments, designations] = await Promise.all([
    prisma.client.findMany({
      where: { branchId, deletedAt: null },
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    }),
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
    clients,
    statuses: ["SCHEDULED", "ACTIVE", "COMPLETED", "CANCELLED"],
    departments: departments
      .map((item) => item.department)
      .filter((value): value is string => Boolean(value)),
    designations: designations
      .map((item) => item.designation)
      .filter((value): value is string => Boolean(value)),
  };
}

export async function listDeploymentContracts(
  branchId: string,
  deploymentId: string,
) {
  const deployment = await prisma.deployment.findFirst({
    where: { id: deploymentId, branchId, deletedAt: null },
    select: { id: true },
  });

  if (!deployment) {
    return [];
  }

  const contracts = await prisma.deploymentContract.findMany({
    where: { deploymentId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return contracts;
}
