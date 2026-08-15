import { mapClientToDetail } from "@/application/mappers/client-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { ClientDetail } from "@/types/client";

type GetClientParams = {
  branchId: string;
  clientId: string;
  includeDeleted?: boolean;
};

type GetClientResult =
  { success: true; client: ClientDetail } | { success: false; error: string };

export async function getClient({
  branchId,
  clientId,
  includeDeleted = false,
}: GetClientParams): Promise<GetClientResult> {
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      branchId,
      ...(includeDeleted ? {} : { deletedAt: null }),
    },
  });

  if (!client) {
    return { success: false, error: "Client not found" };
  }

  return { success: true, client: mapClientToDetail(client) };
}
