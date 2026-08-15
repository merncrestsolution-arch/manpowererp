import { writeAuditLog } from "@/application/use-cases/write-audit-log";

import type { Prisma } from "@prisma/client";

type AuditLoggerParams = {
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
 * Shared audit helper for use across use-cases.
 * Phases 2–14 still rely on hardcoded role checks; adopt this logger incrementally.
 */
export async function auditLogger(params: AuditLoggerParams) {
  return writeAuditLog(params);
}
