import { z } from "zod";

export const quotationStatusSchema = z.enum([
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CONVERTED",
]);

export const lineItemSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than zero"),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
});

export const createQuotationSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  validUntil: z.string().min(1, "Valid until date is required"),
  status: quotationStatusSchema.optional(),
  taxAmount: z.coerce.number().min(0).default(0),
  notes: z.string().trim().optional(),
  lineItems: z
    .array(lineItemSchema)
    .min(1, "At least one line item is required"),
});

export const updateQuotationSchema = createQuotationSchema
  .partial()
  .extend({
    lineItems: z.array(lineItemSchema).min(1).optional(),
    status: quotationStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const listQuotationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  clientId: z.string().trim().optional(),
  status: quotationStatusSchema.optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
  includeDeleted: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  sortBy: z
    .enum([
      "quotationNo",
      "issueDate",
      "validUntil",
      "total",
      "status",
      "createdAt",
    ])
    .default("issueDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationInput = z.infer<typeof updateQuotationSchema>;
export type ListQuotationsQuery = z.infer<typeof listQuotationsQuerySchema>;
