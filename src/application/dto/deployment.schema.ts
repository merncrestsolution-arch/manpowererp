import { z } from "zod";

export const deploymentStatusSchema = z.enum([
  "SCHEDULED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);

const deploymentBaseSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  clientId: z.string().min(1, "Client is required"),
  workLocationId: z.string().min(1, "Work location is required"),
  shiftId: z.string().min(1, "Shift is required"),
  contractRefId: z.string().optional().or(z.literal("")),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
  status: deploymentStatusSchema.default("SCHEDULED"),
  assignmentRole: z.string().trim().min(1, "Assignment role is required"),
});

export const createDeploymentSchema = deploymentBaseSchema.refine(
  (data) => {
    if (!data.endDate) {
      return true;
    }
    return new Date(data.endDate) >= new Date(data.startDate);
  },
  { message: "End date must be on or after start date", path: ["endDate"] },
);

export const updateDeploymentSchema = deploymentBaseSchema.partial().extend({
  assignmentRole: z.string().trim().min(1).optional(),
});

export const endDeploymentSchema = z.object({
  endDate: z.string().optional(),
});

export const reassignShiftSchema = z.object({
  shiftId: z.string().min(1, "Shift is required"),
  effectiveFrom: z.string().optional(),
});

export const listDeploymentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  clientId: z.string().trim().optional(),
  status: deploymentStatusSchema.optional(),
  includeDeleted: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  sortBy: z
    .enum(["deploymentNo", "startDate", "endDate", "status", "createdAt"])
    .default("startDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateDeploymentInput = z.infer<typeof createDeploymentSchema>;
export type UpdateDeploymentInput = z.infer<typeof updateDeploymentSchema>;
export type EndDeploymentInput = z.infer<typeof endDeploymentSchema>;
export type ReassignShiftInput = z.infer<typeof reassignShiftSchema>;
export type ListDeploymentsQuery = z.infer<typeof listDeploymentsQuerySchema>;
