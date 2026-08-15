import { auditLogger } from "@/infrastructure/audit/audit-logger";
import { prisma } from "@/infrastructure/db/prisma";
import { resolveOrganizationIdForBranch } from "@/lib/organization";

type DeactivateUserParams = {
  branchId: string;
  userId: string;
  targetUserId: string;
  isActive: boolean;
};

export async function deactivateUser({
  branchId,
  userId,
  targetUserId,
  isActive,
}: DeactivateUserParams) {
  if (userId === targetUserId && !isActive) {
    return {
      success: false as const,
      error: "You cannot deactivate your own account",
    };
  }

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

  await prisma.user.update({
    where: { id: targetUserId },
    data: { isActive, updatedBy: userId },
  });

  await auditLogger({
    organizationId,
    branchId,
    userId,
    action: isActive ? "REACTIVATE" : "DEACTIVATE",
    entityType: "User",
    entityId: targetUserId,
  });

  return { success: true as const };
}
