import { mapClientBillingRecord } from "@/application/mappers/client-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { ClientBillingRecordItem } from "@/types/client";

export async function listClientBillingHistory(
  branchId: string,
  clientId: string,
): Promise<ClientBillingRecordItem[]> {
  const client = await prisma.client.findFirst({
    where: { id: clientId, branchId, deletedAt: null },
    select: { id: true },
  });

  if (!client) {
    return [];
  }

  const records = await prisma.clientBillingRecord.findMany({
    where: { clientId, deletedAt: null },
    orderBy: [{ periodStart: "desc" }],
  });

  return records.map(mapClientBillingRecord);
}
