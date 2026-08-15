import { mapClientToDetail } from "@/application/mappers/client-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { UpdateClientInput } from "@/application/dto/client.schema";
import type { ClientDetail } from "@/types/client";

type UpdateClientParams = {
  branchId: string;
  clientId: string;
  userId: string;
  input: UpdateClientInput;
  canBlacklist: boolean;
};

type UpdateClientResult =
  { success: true; client: ClientDetail } | { success: false; error: string };

export async function updateClient({
  branchId,
  clientId,
  userId,
  input,
  canBlacklist,
}: UpdateClientParams): Promise<UpdateClientResult> {
  const existing = await prisma.client.findFirst({
    where: { id: clientId, branchId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Client not found" };
  }

  if (input.status === "BLACKLISTED" && !canBlacklist) {
    return { success: false, error: "Forbidden" };
  }

  const client = await prisma.client.update({
    where: { id: clientId },
    data: {
      ...(input.companyName !== undefined
        ? { companyName: input.companyName }
        : {}),
      ...(input.registrationNo !== undefined
        ? { registrationNo: input.registrationNo || null }
        : {}),
      ...(input.industry !== undefined
        ? { industry: input.industry || null }
        : {}),
      ...(input.address !== undefined
        ? { address: input.address || null }
        : {}),
      ...(input.city !== undefined ? { city: input.city || null } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.creditTermDays !== undefined
        ? { creditTermDays: input.creditTermDays }
        : {}),
      ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
      updatedBy: userId,
    },
  });

  return { success: true, client: mapClientToDetail(client) };
}
