import { describe, expect, it } from "vitest";

import { getNextSequenceValue } from "@/lib/sequence";

import type { Prisma } from "@prisma/client";

function createInMemorySequenceTx() {
  const store = new Map<string, number>();

  const tx = {
    sequence: {
      upsert: async ({
        where,
        create,
      }: {
        where: { branchId_key: { branchId: string; key: string } };
        create: { branchId: string; key: string; value: number };
      }) => {
        const mapKey = `${where.branchId_key.branchId}:${where.branchId_key.key}`;
        if (!store.has(mapKey)) {
          store.set(mapKey, create.value);
        }
      },
      update: async ({
        where,
        data,
      }: {
        where: { branchId_key: { branchId: string; key: string } };
        data: { value: { increment: number } };
      }) => {
        const mapKey = `${where.branchId_key.branchId}:${where.branchId_key.key}`;
        const current = store.get(mapKey) ?? 0;
        const next = current + data.value.increment;
        store.set(mapKey, next);
        return { value: next };
      },
    },
  };

  return {
    tx: tx as unknown as Prisma.TransactionClient,
    store,
  };
}

describe("getNextSequenceValue concurrency", () => {
  it("returns unique values under parallel calls within a transaction scope", async () => {
    const { tx } = createInMemorySequenceTx();

    const values = await Promise.all(
      Array.from({ length: 20 }, () =>
        getNextSequenceValue(tx, "branch-1", "invoice_no"),
      ),
    );

    expect(new Set(values).size).toBe(20);
    expect(values.sort((a, b) => a - b)).toEqual(
      Array.from({ length: 20 }, (_, index) => index + 1),
    );
  });
});
