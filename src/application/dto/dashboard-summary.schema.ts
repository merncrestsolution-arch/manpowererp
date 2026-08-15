import { z } from "zod";

export const trendDirectionSchema = z.enum(["up", "down", "neutral"]);

export const kpiFormatSchema = z.enum(["number", "currency"]);

export const kpiMetricSchema = z.object({
  label: z.string(),
  value: z.number(),
  trend: z.number(),
  trendDirection: trendDirectionSchema,
  format: kpiFormatSchema.optional(),
});

export const activityTypeSchema = z.enum([
  "payment",
  "leave",
  "announcement",
  "employee",
  "invoice",
  "expense",
  "attendance",
  "general",
]);

export const activityItemSchema = z.object({
  id: z.string(),
  type: activityTypeSchema,
  title: z.string(),
  description: z.string(),
  timestamp: z.string(),
  actorName: z.string().optional(),
});

export const payrollSummarySchema = z.object({
  currentPeriodLabel: z.string(),
  totalAmount: z.number(),
  pendingApprovals: z.number(),
  currency: z.string(),
});

export const attendanceSummarySchema = z.object({
  present: z.number(),
  absent: z.number(),
  late: z.number(),
  totalEmployees: z.number(),
  trend: z.number(),
  trendDirection: trendDirectionSchema,
});

export const dashboardKpisSchema = z.object({
  totalEmployees: kpiMetricSchema,
  activeClients: kpiMetricSchema,
  monthlyRevenue: kpiMetricSchema,
  monthlyExpenses: kpiMetricSchema,
  pendingLeaveRequests: kpiMetricSchema,
  openPositions: kpiMetricSchema,
});

export const dashboardSummarySchema = z.object({
  kpis: dashboardKpisSchema,
  payroll: payrollSummarySchema,
  attendance: attendanceSummarySchema,
  activities: z.array(activityItemSchema),
});

export const chartDataPointSchema = z.object({
  label: z.string(),
  value: z.number(),
});

export const revenueTrendSchema = z.object({
  points: z.array(chartDataPointSchema),
  periodLabel: z.string(),
});

export const expenseBreakdownSchema = z.object({
  categories: z.array(chartDataPointSchema),
  periodLabel: z.string(),
});

export type DashboardSummaryDto = z.infer<typeof dashboardSummarySchema>;
export type RevenueTrendDto = z.infer<typeof revenueTrendSchema>;
export type ExpenseBreakdownDto = z.infer<typeof expenseBreakdownSchema>;
