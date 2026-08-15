import { prisma } from "@/infrastructure/db/prisma";

type DeleteClientParams = {
  branchId: string;
  clientId: string;
  userId: string;
};

type DeleteClientResult = { success: true } | { success: false; error: string };

export async function deleteClient({
  branchId,
  clientId,
  userId,
}: DeleteClientParams): Promise<DeleteClientResult> {
  const existing = await prisma.client.findFirst({
    where: { id: clientId, branchId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Client not found" };
  }

  await prisma.client.update({
    where: { id: clientId },
    data: {
      deletedAt: new Date(),
      updatedBy: userId,
    },
  });

  return { success: true };
}

export async function restoreClient({
  branchId,
  clientId,
  userId,
}: DeleteClientParams): Promise<DeleteClientResult> {
  const existing = await prisma.client.findFirst({
    where: { id: clientId, branchId, deletedAt: { not: null } },
  });

  if (!existing) {
    return { success: false, error: "Deleted client not found" };
  }

  await prisma.client.update({
    where: { id: clientId },
    data: {
      deletedAt: null,
      updatedBy: userId,
    },
  });

  return { success: true };
}
