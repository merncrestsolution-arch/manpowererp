import { z } from "zod";

export const createClientContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  designation: z.string().trim().optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  isPrimary: z.boolean().default(false),
});

export const updateClientContactSchema = createClientContactSchema
  .partial()
  .extend({
    contactId: z.string().min(1),
  });

export type CreateClientContactInput = z.infer<
  typeof createClientContactSchema
>;
export type UpdateClientContactInput = z.infer<
  typeof updateClientContactSchema
>;
