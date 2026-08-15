import { prisma } from "@/infrastructure/db/prisma";

import type { Role } from "@prisma/client";

/**
 * Permission-aware access check (additive layer over hardcoded Role checks).
 *
 * Phases 2–14 use-cases still call can*() helpers from roles.ts directly.
 * New modules (Mobile App, Final Phase) should prefer this function.
 *
 * Returns true only when a RolePermission row exists with isGranted=true.
 */
export async function checkPermission(
  role: Role,
  permissionCode: string,
): Promise<boolean> {
  const rolePermission = await prisma.rolePermission.findFirst({
    where: {
      role,
      isGranted: true,
      permission: { code: permissionCode },
    },
    select: { id: true },
  });

  return Boolean(rolePermission);
}

export async function checkAnyPermission(
  role: Role,
  permissionCodes: string[],
): Promise<boolean> {
  if (permissionCodes.length === 0) {
    return false;
  }

  const count = await prisma.rolePermission.count({
    where: {
      role,
      isGranted: true,
      permission: { code: { in: permissionCodes } },
    },
  });

  return count > 0;
}
