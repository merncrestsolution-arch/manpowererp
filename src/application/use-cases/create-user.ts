import { auditLogger } from "@/infrastructure/audit/audit-logger";
import { hashPassword } from "@/infrastructure/auth/password";
import { prisma } from "@/infrastructure/db/prisma";
import { resolveOrganizationIdForBranch } from "@/lib/organization";

import type { CreateUserInput } from "@/application/dto/user.schema";
import type { SettingsUserDetail } from "@/types/settings";

function mapUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  branchId: string | null;
  createdAt: Date;
  updatedAt: Date;
  branch: { name: string } | null;
}): SettingsUserDetail {
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

type CreateUserParams = {
  branchId: string;
  userId: string;
  input: CreateUserInput;
};

export async function createUser({
  branchId,
  userId,
  input,
}: CreateUserParams) {
  const organizationId = await resolveOrganizationIdForBranch(branchId);
  const email = input.email.toLowerCase();

  const existing = await prisma.user.findFirst({
    where: { email },
  });

  if (existing) {
    return { success: false as const, error: "Email is already in use" };
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

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email,
      name: input.name,
      passwordHash,
      role: input.role,
      branchId: input.branchId ?? branchId,
      isActive: true,
      createdBy: userId,
      updatedBy: userId,
    },
    include: { branch: { select: { name: true } } },
  });

  await auditLogger({
    organizationId,
    branchId,
    userId,
    action: "CREATE",
    entityType: "User",
    entityId: user.id,
    changes: { email: user.email, role: user.role },
  });

  return { success: true as const, user: mapUser(user) };
}
