import { z } from "zod";

export const payrollPeriodStatusSchema = z.enum([
  "DRAFT",
  "PROCESSING",
  "FINALIZED",
  "PAID",
]);

export const createPayrollPeriodSchema = z
  .object({
    periodStart: z.string().min(1, "Period start is required"),
    periodEnd: z.string().min(1, "Period end is required"),
    payDate: z.string().min(1, "Pay date is required"),
  })
  .refine((data) => new Date(data.periodStart) <= new Date(data.periodEnd), {
    message: "Period start must be before period end",
    path: ["periodEnd"],
  });

export const updatePayrollPeriodSchema = z.object({
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  payDate: z.string().optional(),
  status: payrollPeriodStatusSchema.optional(),
});

export const listPayrollPeriodsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  status: payrollPeriodStatusSchema.optional(),
  sortBy: z
    .enum(["periodStart", "periodEnd", "payDate", "createdAt"])
    .default("periodStart"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreatePayrollPeriodInput = z.infer<
  typeof createPayrollPeriodSchema
>;
export type UpdatePayrollPeriodInput = z.infer<
  typeof updatePayrollPeriodSchema
>;
export type ListPayrollPeriodsQuery = z.infer<
  typeof listPayrollPeriodsQuerySchema
>;
