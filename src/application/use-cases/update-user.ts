import { auditLogger } from "@/infrastructure/audit/audit-logger";
import { prisma } from "@/infrastructure/db/prisma";
import { resolveOrganizationIdForBranch } from "@/lib/organization";

import type { UpdateUserInput } from "@/application/dto/user.schema";
import type { SettingsUserDetail } from "@/types/settings";

type GetUserParams = {
  branchId: string;
  targetUserId: string;
};

export async function getUser({
  branchId,
  targetUserId,
}: GetUserParams): Promise<SettingsUserDetail | null> {
  const organizationId = await resolveOrganizationIdForBranch(branchId);

  const user = await prisma.user.findFirst({
    where: {
      id: targetUserId,
      deletedAt: null,
      branch: { organizationId },
    },
    include: { branch: { select: { name: true } } },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    branchId: user.branchId,
    branchName: user.branch?.name ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

type UpdateUserParams = {
  branchId: string;
  userId: string;
  targetUserId: string;
  input: UpdateUserInput;
};

export async function updateUser({
  branchId,
  userId,
  targetUserId,
  input,
}: UpdateUserParams) {
  const organizationId = await resolveOrganizationIdForBranch(branchId);

  const existing = await prisma.user.findFirst({
    where: {
      id: targetUserId,
      deletedAt: null,
      branch: { organizationId },
    },
  });

  if (!existing) {
    return { success: false as const, error: "User not found" };
  }

  if (input.branchId) {
    const targetBranch = await prisma.branch.findFirst({
      where: {
        id: input.branchId,
        organizationId,
        deletedAt: null,
      },
    });
    if (!targetBranch) {
      return { success: false as const, error: "Branch not found" };
    }
  }

  const user = await prisma.user.update({
    where: { id: targetUserId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.branchId !== undefined ? { branchId: input.branchId } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      updatedBy: userId,
    },
    include: { branch: { select: { name: true } } },
  });

  await auditLogger({
    organizationId,
    branchId,
    userId,
    action: "UPDATE",
    entityType: "User",
    entityId: user.id,
    changes: {
      before: { role: existing.role, isActive: existing.isActive },
      after: input,
    },
  });

  return {
    success: true as const,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      branchId: user.branchId,
      branchName: user.branch?.name ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
  };
}
