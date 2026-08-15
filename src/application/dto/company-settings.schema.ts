import { z } from "zod";

export const updateCompanySettingsSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  registrationNo: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  taxId: z.string().optional(),
  fiscalYearStart: z.coerce.number().int().min(1).max(12),
});

export type UpdateCompanySettingsInput = z.infer<
  typeof updateCompanySettingsSchema
>;
