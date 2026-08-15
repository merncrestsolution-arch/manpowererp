import { z } from "zod";

export const expenseStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "PAID",
]);

export const createExpenseSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().trim().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  expenseDate: z.string().min(1, "Expense date is required"),
  receiptUrl: z.string().url().optional().or(z.literal("")),
});

export const updateExpenseSchema = createExpenseSchema;

export const listExpensesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  status: expenseStatusSchema.optional(),
  paidById: z.string().trim().optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
  includeDeleted: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  sortBy: z
    .enum(["expenseNo", "expenseDate", "amount", "status", "createdAt"])
    .default("expenseDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const expenseReportQuerySchema = z.object({
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
export type ExpenseReportQuery = z.infer<typeof expenseReportQuerySchema>;
