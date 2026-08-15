import { prisma } from "@/infrastructure/db/prisma";

export async function resolveOrganizationIdForBranch(
  branchId: string,
): Promise<string> {
  const branch = await prisma.branch.findFirst({
    where: { id: branchId, deletedAt: null },
    select: { organizationId: true },
  });

  if (!branch) {
    throw new Error("Branch not found");
  }

  return branch.organizationId;
}

export async function resolveOrganizationIdForUser(
  userId: string,
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { branchId: true },
  });

  if (user?.branchId) {
    return resolveOrganizationIdForBranch(user.branchId);
  }

  const org = await prisma.organization.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!org) {
    throw new Error("Organization not found");
  }

  return org.id;
}
