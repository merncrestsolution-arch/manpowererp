import { z } from "zod";

export const leaveTypeSchema = z.enum(["ANNUAL", "CASUAL", "SICK", "UNPAID"]);

export const leaveStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const createLeaveRequestSchema = z
  .object({
    type: leaveTypeSchema,
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z.string().trim().min(1, "Reason is required"),
  })
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    "End date must be on or after start date",
  );

export const updateLeaveStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;
export type UpdateLeaveStatusInput = z.infer<typeof updateLeaveStatusSchema>;
