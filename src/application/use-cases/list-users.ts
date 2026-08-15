import { prisma } from "@/infrastructure/db/prisma";
import { resolveOrganizationIdForBranch } from "@/lib/organization";

import type { ListUsersQuery } from "@/application/dto/user.schema";
import type { PaginatedResult } from "@/types/employee";
import type { SettingsUserItem } from "@/types/settings";

export async function listUsers(
  branchId: string,
  query: ListUsersQuery,
): Promise<PaginatedResult<SettingsUserItem>> {
  const organizationId = await resolveOrganizationIdForBranch(branchId);

  const where = {
    deletedAt: null,
    branch: { organizationId },
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            { email: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(query.role ? { role: query.role } : {}),
    ...(query.isActive ? { isActive: query.isActive === "true" } : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: { branch: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);

  return {
    items: users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      branchId: user.branchId,
      branchName: user.branch?.name ?? null,
      createdAt: user.createdAt.toISOString(),
    })),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.ceil(total / query.pageSize),
  };
}
