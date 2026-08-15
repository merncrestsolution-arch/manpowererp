import { z } from "zod";

export const attendanceCheckMethodSchema = z.enum(["QR", "GPS", "MANUAL"]);
export const attendanceStatusSchema = z.enum([
  "PRESENT",
  "LATE",
  "ABSENT",
  "HALF_DAY",
  "ON_LEAVE",
]);

export const checkInSchema = z.object({
  method: z.enum(["QR", "GPS"]),
  qrCode: z.string().trim().optional(),
  latitude: z.number().finite().optional(),
  longitude: z.number().finite().optional(),
});

export const checkOutSchema = z.object({
  method: z.enum(["QR", "GPS"]),
  qrCode: z.string().trim().optional(),
  latitude: z.number().finite().optional(),
  longitude: z.number().finite().optional(),
});

export const listAttendanceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  status: attendanceStatusSchema.optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
  employeeId: z.string().trim().optional(),
  sortBy: z.enum(["date", "checkInAt", "status", "createdAt"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const timesheetQuerySchema = z.object({
  employeeId: z.string().trim().optional(),
  period: z.enum(["week", "month"]).default("week"),
  date: z.string().trim().optional(),
});

export const generateQrCheckpointSchema = z.object({
  workLocationId: z.string().min(1, "Work location is required"),
  expiresInHours: z.coerce.number().int().min(1).max(168).optional(),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type ListAttendanceQuery = z.infer<typeof listAttendanceQuerySchema>;
export type TimesheetQuery = z.infer<typeof timesheetQuerySchema>;
export type GenerateQrCheckpointInput = z.infer<
  typeof generateQrCheckpointSchema
>;
