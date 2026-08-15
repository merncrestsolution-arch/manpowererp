import { prisma } from "@/infrastructure/db/prisma";
import {
  PERMISSION_CATALOG,
  DEFAULT_ROLE_PERMISSIONS,
} from "@/lib/permissions-catalog";

import type { Role } from "@prisma/client";

export async function seedPermissions(userId?: string): Promise<void> {
  for (const permission of PERMISSION_CATALOG) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {
        module: permission.module,
        description: permission.description,
        updatedBy: userId,
      },
      create: {
        code: permission.code,
        module: permission.module,
        description: permission.description,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  const permissions = await prisma.permission.findMany({
    select: { id: true, code: true },
  });
  const permissionByCode = new Map(
    permissions.map((permission) => [permission.code, permission.id]),
  );

  const roles = Object.keys(DEFAULT_ROLE_PERMISSIONS) as Role[];

  for (const role of roles) {
    const grantedCodes = DEFAULT_ROLE_PERMISSIONS[role];

    for (const permission of PERMISSION_CATALOG) {
      const permissionId = permissionByCode.get(permission.code);
      if (!permissionId) {
        continue;
      }

      const isGranted = grantedCodes.includes(permission.code);

      await prisma.rolePermission.upsert({
        where: {
          role_permissionId: { role, permissionId },
        },
        update: {},
        create: {
          role,
          permissionId,
          isGranted,
          createdBy: userId,
          updatedBy: userId,
        },
      });
    }
  }
}
