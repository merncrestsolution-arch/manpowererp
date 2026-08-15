import { z } from "zod";

export const approveExpenseSchema = z.object({
  remarks: z.string().trim().optional().or(z.literal("")),
});

export const rejectExpenseSchema = z.object({
  reason: z.string().trim().min(1, "Rejection reason is required"),
  remarks: z.string().trim().optional().or(z.literal("")),
});

export type ApproveExpenseInput = z.infer<typeof approveExpenseSchema>;
export type RejectExpenseInput = z.infer<typeof rejectExpenseSchema>;
