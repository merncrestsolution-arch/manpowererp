import { z } from "zod";

export const employeeDocumentTypeSchema = z.enum([
  "CV",
  "NIC_COPY",
  "CERTIFICATE",
  "CONTRACT",
  "OTHER",
]);

export const createEmployeeDocumentSchema = z.object({
  type: employeeDocumentTypeSchema,
  fileUrl: z.string().url("Invalid file URL"),
  fileName: z.string().trim().min(1, "File name is required"),
});

export type CreateEmployeeDocumentInput = z.infer<
  typeof createEmployeeDocumentSchema
>;
