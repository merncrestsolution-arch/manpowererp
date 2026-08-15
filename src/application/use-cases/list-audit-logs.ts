import { endOfDay, startOfDay } from "date-fns";

import { prisma } from "@/infrastructure/db/prisma";
import { resolveOrganizationIdForBranch } from "@/lib/organization";

import type { ListAuditLogsQuery } from "@/application/dto/role-permission.schema";
import type { PaginatedResult } from "@/types/employee";
import type { AuditLogItem } from "@/types/settings";

function parseDate(value?: string): Date | null {
  if (!value) {
    return null;
  }
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function listAuditLogs(
  branchId: string,
  query: ListAuditLogsQuery,
): Promise<PaginatedResult<AuditLogItem>> {
  const organizationId = await resolveOrganizationIdForBranch(branchId);
  const dateFrom = parseDate(query.dateFrom);
  const dateTo = parseDate(query.dateTo);

  const where = {
    organizationId,
    ...(query.userId ? { userId: query.userId } : {}),
    ...(query.action ? { action: query.action } : {}),
    ...(query.entityType ? { entityType: query.entityType } : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: startOfDay(dateFrom) } : {}),
            ...(dateTo ? { lte: endOfDay(dateTo) } : {}),
          },
        }
      : {}),
  };

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);

  return {
    items: logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      userName: log.user?.name ?? null,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      changes: (log.changes as Record<string, unknown> | null) ?? null,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt.toISOString(),
    })),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.ceil(total / query.pageSize),
  };
}
