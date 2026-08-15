import { z } from "zod";

export const jobOpeningStatusSchema = z.enum(["OPEN", "CLOSED", "ON_HOLD"]);

export const createJobOpeningSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  department: z.string().trim().optional().or(z.literal("")),
  clientId: z.string().trim().optional().or(z.literal("")),
  positionsAvailable: z.coerce.number().int().min(1).default(1),
  status: jobOpeningStatusSchema.default("OPEN"),
});

export const updateJobOpeningSchema = createJobOpeningSchema.partial();

export const listJobOpeningsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  status: jobOpeningStatusSchema.optional(),
  includeDeleted: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  sortBy: z
    .enum(["title", "department", "status", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateJobOpeningInput = z.infer<typeof createJobOpeningSchema>;
export type UpdateJobOpeningInput = z.infer<typeof updateJobOpeningSchema>;
export type ListJobOpeningsQuery = z.infer<typeof listJobOpeningsQuerySchema>;
