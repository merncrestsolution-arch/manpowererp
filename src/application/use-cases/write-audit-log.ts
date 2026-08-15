import { prisma } from "@/infrastructure/db/prisma";

import type { Prisma } from "@prisma/client";

type WriteAuditLogParams = {
  organizationId?: string;
  branchId?: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
};

/**
 * Append-only audit log writer. No update/delete operations are exposed.
 * Call from use-cases when mutating sensitive data (Settings module and beyond).
 */
export async function writeAuditLog(params: WriteAuditLogParams) {
  return prisma.auditLog.create({
    data: {
      organizationId: params.organizationId,
      branchId: params.branchId,
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      changes: params.changes,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}
