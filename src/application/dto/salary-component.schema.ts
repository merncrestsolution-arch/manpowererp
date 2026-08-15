import { z } from "zod";

export const salaryComponentTypeSchema = z.enum(["ALLOWANCE", "DEDUCTION"]);
export const salaryCalculationTypeSchema = z.enum([
  "FIXED",
  "PERCENTAGE_OF_BASIC",
]);

export const configureSalaryComponentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  type: salaryComponentTypeSchema,
  calculationType: salaryCalculationTypeSchema,
  defaultValue: z.coerce.number().min(0),
  isTaxable: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const listSalaryComponentsQuerySchema = z.object({
  type: salaryComponentTypeSchema.optional(),
  includeInactive: z.coerce.boolean().optional().default(false),
});

export type ConfigureSalaryComponentInput = z.infer<
  typeof configureSalaryComponentSchema
>;
export type ListSalaryComponentsQuery = z.infer<
  typeof listSalaryComponentsQuerySchema
>;
