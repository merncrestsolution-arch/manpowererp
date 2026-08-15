import { z } from "zod";

export const assignWorkerToClientSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  role: z.string().trim().min(1, "Role is required"),
  assignedFrom: z.string().min(1, "Start date is required"),
  assignedTo: z.string().optional().or(z.literal("")),
});

export const endWorkerAssignmentSchema = z.object({
  assignmentId: z.string().min(1),
  assignedTo: z.string().optional().or(z.literal("")),
});

export type AssignWorkerToClientInput = z.infer<
  typeof assignWorkerToClientSchema
>;
export type EndWorkerAssignmentInput = z.infer<
  typeof endWorkerAssignmentSchema
>;
