import { z } from "zod";

export const overtimeStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const approveOvertimeSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export const listOvertimeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  status: overtimeStatusSchema.optional(),
  employeeId: z.string().trim().optional(),
});

export type ApproveOvertimeInput = z.infer<typeof approveOvertimeSchema>;
export type ListOvertimeQuery = z.infer<typeof listOvertimeQuerySchema>;
