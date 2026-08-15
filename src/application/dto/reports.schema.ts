import { z } from "zod";

export const reportDateRangeQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type ReportDateRangeQuery = z.infer<typeof reportDateRangeQuerySchema>;
