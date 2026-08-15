import { z } from "zod";

const roleEnum = z.enum([
  "SUPER_ADMIN",
  "ADMIN",
  "HR_MANAGER",
  "FINANCE_MANAGER",
  "RECRUITER",
  "EMPLOYEE",
]);

export const updateRolePermissionSchema = z.object({
  role: roleEnum,
  permissionId: z.string().min(1),
  isGranted: z.boolean(),
});

export type UpdateRolePermissionInput = z.infer<
  typeof updateRolePermissionSchema
>;

export const listAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  userId: z.string().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;
