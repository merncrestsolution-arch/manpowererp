import { z } from "zod";

export const assignEmployeeSalaryComponentSchema = z.object({
  salaryComponentId: z.string().min(1, "Salary component is required"),
  value: z.coerce.number().min(0).nullable().optional(),
  effectiveFrom: z.string().min(1, "Effective from is required"),
  effectiveTo: z.string().nullable().optional(),
});

export const listPayslipsQuerySchema = z.object({
  payrollPeriodId: z.string().optional(),
  employeeId: z.string().optional(),
  status: z.enum(["DRAFT", "FINALIZED", "PAID"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const payrollSummaryQuerySchema = z.object({
  periodId: z.string().optional(),
});

export type AssignEmployeeSalaryComponentInput = z.infer<
  typeof assignEmployeeSalaryComponentSchema
>;
export type ListPayslipsQuery = z.infer<typeof listPayslipsQuerySchema>;
export type PayrollSummaryQuery = z.infer<typeof payrollSummaryQuerySchema>;
