import { z } from "zod";

export const clientStatusSchema = z.enum(["ACTIVE", "INACTIVE", "BLACKLISTED"]);

export const createClientSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  registrationNo: z.string().trim().optional().or(z.literal("")),
  industry: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  status: clientStatusSchema.default("ACTIVE"),
  creditTermDays: z.coerce.number().int().min(0).default(30),
  notes: z.string().trim().optional().or(z.literal("")),
});

export const updateClientSchema = createClientSchema.partial();

export const listClientsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  city: z.string().trim().optional(),
  status: clientStatusSchema.optional(),
  includeDeleted: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  sortBy: z
    .enum([
      "clientNo",
      "companyName",
      "industry",
      "city",
      "status",
      "creditTermDays",
    ])
    .default("clientNo"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
