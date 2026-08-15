import { z } from "zod";

export const assignEmployeeShiftSchema = z
  .object({
    shiftId: z.string().min(1, "Shift is required"),
    effectiveFrom: z.string().min(1, "Effective from date is required"),
    effectiveTo: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) =>
      !data.effectiveTo ||
      new Date(data.effectiveTo) >= new Date(data.effectiveFrom),
    "Effective to must be on or after effective from",
  );

export type AssignEmployeeShiftInput = z.infer<
  typeof assignEmployeeShiftSchema
>;
