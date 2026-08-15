import { z } from "zod";

import type { Role } from "@prisma/client";

const roleEnum = z.enum([
  "SUPER_ADMIN",
  "ADMIN",
  "HR_MANAGER",
  "FINANCE_MANAGER",
  "RECRUITER",
  "EMPLOYEE",
]);

export const createUserSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: roleEnum,
  branchId: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: roleEnum.optional(),
  branchId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type SettingsRole = Role;

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  role: roleEnum.optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
