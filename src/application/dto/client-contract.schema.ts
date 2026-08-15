import { z } from "zod";

export const clientContractStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "EXPIRED",
  "TERMINATED",
]);

export const createClientContractSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: clientContractStatusSchema.default("DRAFT"),
  fileUrl: z.string().trim().optional().or(z.literal("")),
  terms: z.string().trim().optional().or(z.literal("")),
});

export const updateClientContractSchema = createClientContractSchema
  .partial()
  .extend({
    contractId: z.string().min(1),
  });

export type CreateClientContractInput = z.infer<
  typeof createClientContractSchema
>;
export type UpdateClientContractInput = z.infer<
  typeof updateClientContractSchema
>;
