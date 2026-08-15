import { z } from "zod";

export const workLocationStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const createWorkLocationSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  name: z.string().trim().min(1, "Name is required"),
  address: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  geoLat: z.coerce.number().min(-90).max(90).optional().or(z.literal("")),
  geoLng: z.coerce.number().min(-180).max(180).optional().or(z.literal("")),
  status: workLocationStatusSchema.default("ACTIVE"),
});

export const updateWorkLocationSchema = createWorkLocationSchema
  .omit({ clientId: true })
  .partial();

export const listWorkLocationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  clientId: z.string().trim().optional(),
  status: workLocationStatusSchema.optional(),
  includeDeleted: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  sortBy: z.enum(["name", "city", "status", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateWorkLocationInput = z.infer<typeof createWorkLocationSchema>;
export type UpdateWorkLocationInput = z.infer<typeof updateWorkLocationSchema>;
export type ListWorkLocationsQuery = z.infer<
  typeof listWorkLocationsQuerySchema
>;
