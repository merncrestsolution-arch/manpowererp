import { z } from "zod";

export const employmentTypeSchema = z.enum([
  "PERMANENT",
  "CONTRACT",
  "TEMPORARY",
]);

export const employeeStatusSchema = z.enum([
  "ACTIVE",
  "ON_LEAVE",
  "SUSPENDED",
  "TERMINATED",
]);

export const genderSchema = z.enum(["MALE", "FEMALE", "OTHER"]);

export const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  nic: z.string().trim().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: genderSchema.optional(),
  address: z.string().trim().optional().or(z.literal("")),
  department: z.string().trim().optional().or(z.literal("")),
  designation: z.string().trim().optional().or(z.literal("")),
  employmentType: employmentTypeSchema.default("PERMANENT"),
  status: employeeStatusSchema.default("ACTIVE"),
  joinedAt: z.string().optional().or(z.literal("")),
  basicSalary: z.coerce.number().min(0).optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const listEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  department: z.string().trim().optional(),
  designation: z.string().trim().optional(),
  employmentType: employmentTypeSchema.optional(),
  status: employeeStatusSchema.optional(),
  includeDeleted: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  sortBy: z
    .enum([
      "employeeNo",
      "firstName",
      "lastName",
      "department",
      "designation",
      "joinedAt",
      "status",
    ])
    .default("employeeNo"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;
