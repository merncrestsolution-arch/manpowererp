import { z } from "zod";

import { attendanceStatusSchema } from "@/application/dto/attendance.schema";

export const manualAttendanceSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    date: z.string().min(1, "Date is required"),
    checkInAt: z.string().optional(),
    checkOutAt: z.string().optional(),
    status: attendanceStatusSchema,
    manualReason: z
      .string()
      .trim()
      .min(3, "Reason must be at least 3 characters"),
    deploymentId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.checkInAt || !data.checkOutAt) {
        return true;
      }
      return new Date(data.checkOutAt) >= new Date(data.checkInAt);
    },
    {
      message: "Check-out must be on or after check-in",
      path: ["checkOutAt"],
    },
  );

export type ManualAttendanceInput = z.infer<typeof manualAttendanceSchema>;
