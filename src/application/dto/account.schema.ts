import { z } from "zod";

export const chartAccountTypeSchema = z.enum([
  "ASSET",
  "LIABILITY",
  "EQUITY",
  "REVENUE",
  "EXPENSE",
]);

export const createAccountSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Account code is required")
    .max(20, "Account code is too long"),
  name: z
    .string()
    .trim()
    .min(1, "Account name is required")
    .max(120, "Account name is too long"),
  type: chartAccountTypeSchema,
  parentAccountId: z
    .union([z.string().cuid(), z.literal("")])
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
  isActive: z.boolean().default(true),
});

export const updateAccountSchema = createAccountSchema.partial();

export const listAccountsQuerySchema = z.object({
  search: z.string().optional(),
  type: chartAccountTypeSchema.optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  includeDeleted: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

export const ledgerQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const reportPeriodQuerySchema = z.object({
  dateFrom: z.string().min(1, "Start date is required"),
  dateTo: z.string().min(1, "End date is required"),
});

export const balanceSheetQuerySchema = z.object({
  asOfDate: z.string().min(1, "As-of date is required"),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
