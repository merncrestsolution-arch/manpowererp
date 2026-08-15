import { auditLogger } from "@/infrastructure/audit/audit-logger";
import { prisma } from "@/infrastructure/db/prisma";
import { resolveOrganizationIdForBranch } from "@/lib/organization";

import type { UpdateRolePermissionInput } from "@/application/dto/role-permission.schema";
import type { RolePermissionMatrix } from "@/types/settings";

export async function getRolePermissionMatrix(): Promise<RolePermissionMatrix> {
  const [permissions, rolePermissions] = await Promise.all([
    prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { code: "asc" }],
    }),
    prisma.rolePermission.findMany(),
  ]);

  const roles = [
    "SUPER_ADMIN",
    "ADMIN",
    "HR_MANAGER",
    "FINANCE_MANAGER",
    "RECRUITER",
    "EMPLOYEE",
  ];

  const grants: Record<string, Record<string, boolean>> = {};
  for (const role of roles) {
    grants[role] = {};
    for (const permission of permissions) {
      grants[role][permission.id] = false;
    }
  }

  for (const entry of rolePermissions) {
    if (!grants[entry.role]) {
      grants[entry.role] = {};
    }
    grants[entry.role][entry.permissionId] = entry.isGranted;
  }

  return {
    roles,
    permissions: permissions.map((permission) => ({
      id: permission.id,
      code: permission.code,
      module: permission.module,
      description: permission.description,
    })),
    grants,
  };
}

type UpdateRolePermissionParams = {
  branchId: string;
  userId: string;
  input: UpdateRolePermissionInput;
};

export async function updateRolePermission({
  branchId,
  userId,
  input,
}: UpdateRolePermissionParams) {
  const organizationId = await resolveOrganizationIdForBranch(branchId);

  const permission = await prisma.permission.findUnique({
    where: { id: input.permissionId },
  });

  if (!permission) {
    return { success: false as const, error: "Permission not found" };
  }

  const rolePermission = await prisma.rolePermission.upsert({
    where: {
      role_permissionId: {
        role: input.role,
        permissionId: input.permissionId,
      },
    },
    update: {
      isGranted: input.isGranted,
      updatedBy: userId,
    },
    create: {
      role: input.role,
      permissionId: input.permissionId,
      isGranted: input.isGranted,
      createdBy: userId,
      updatedBy: userId,
    },
  });

  await auditLogger({
    organizationId,
    branchId,
    userId,
    action: "UPDATE",
    entityType: "RolePermission",
    entityId: rolePermission.id,
    changes: {
      role: input.role,
      permission: permission.code,
      isGranted: input.isGranted,
    },
  });

  return { success: true as const };
}
