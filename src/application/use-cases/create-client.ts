import { mapClientToDetail } from "@/application/mappers/client-mapper";
import { prisma } from "@/infrastructure/db/prisma";
import { formatClientNo, getNextSequenceValue } from "@/lib/sequence";

import type { CreateClientInput } from "@/application/dto/client.schema";
import type { ClientDetail } from "@/types/client";

type CreateClientParams = {
  branchId: string;
  userId: string;
  input: CreateClientInput;
};

type CreateClientResult =
  { success: true; client: ClientDetail } | { success: false; error: string };

export async function createClient({
  branchId,
  userId,
  input,
}: CreateClientParams): Promise<CreateClientResult> {
  try {
    const client = await prisma.$transaction(async (tx) => {
      const sequenceValue = await getNextSequenceValue(
        tx,
        branchId,
        "client_no",
      );
      const clientNo = formatClientNo(sequenceValue);

      return tx.client.create({
        data: {
          branchId,
          clientNo,
          companyName: input.companyName,
          registrationNo: input.registrationNo || null,
          industry: input.industry || null,
          address: input.address || null,
          city: input.city || null,
          status: input.status,
          creditTermDays: input.creditTermDays,
          notes: input.notes || null,
          createdBy: userId,
          updatedBy: userId,
        },
      });
    });

    return { success: true, client: mapClientToDetail(client) };
  } catch {
    return { success: false, error: "Failed to create client" };
  }
}
