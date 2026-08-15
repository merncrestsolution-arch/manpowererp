import { prisma } from "@/infrastructure/db/prisma";

export async function searchClients({
  branchId,
  query,
  limit,
}: {
  branchId: string;
  query: string;
  limit: number;
}) {
  return prisma.client.findMany({
    where: {
      branchId,
      deletedAt: null,
      OR: [
        { companyName: { contains: query, mode: "insensitive" } },
        { clientNo: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      clientNo: true,
      companyName: true,
      city: true,
    },
    orderBy: { companyName: "asc" },
    take: limit,
  });
}

export async function listBranchShiftsForDeployment(branchId: string) {
  return prisma.shift.findMany({
    where: { branchId, deletedAt: null },
    select: { id: true, name: true, startTime: true, endTime: true },
    orderBy: { name: "asc" },
  });
}
