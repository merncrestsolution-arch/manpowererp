import { prisma } from "@/infrastructure/db/prisma";

export async function resolveEmployeeForUser(
  branchId: string,
  userId: string,
): Promise<{ id: string; firstName: string; lastName: string } | null> {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null, isActive: true },
    select: { email: true },
  });

  if (!user?.email) {
    return null;
  }

  return prisma.employee.findFirst({
    where: {
      branchId,
      email: user.email,
      deletedAt: null,
      status: { not: "TERMINATED" },
    },
    select: { id: true, firstName: true, lastName: true },
  });
}

export async function getActiveDeploymentForEmployee(
  branchId: string,
  employeeId: string,
) {
  return prisma.deployment.findFirst({
    where: {
      branchId,
      employeeId,
      deletedAt: null,
      status: "ACTIVE",
    },
    include: {
      workLocation: {
        select: {
          id: true,
          name: true,
          geoLat: true,
          geoLng: true,
          status: true,
        },
      },
      shift: {
        select: {
          id: true,
          name: true,
          startTime: true,
          endTime: true,
        },
      },
    },
    orderBy: { startDate: "desc" },
  });
}
