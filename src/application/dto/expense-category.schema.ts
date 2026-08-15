import { z } from "zod";

export const createExpenseCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const updateExpenseCategorySchema =
  createExpenseCategorySchema.partial();

export type CreateExpenseCategoryInput = z.infer<
  typeof createExpenseCategorySchema
>;
export type UpdateExpenseCategoryInput = z.infer<
  typeof updateExpenseCategorySchema
>;
