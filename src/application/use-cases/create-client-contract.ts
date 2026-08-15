import {
  mapClientContract,
  parseOptionalDate,
} from "@/application/mappers/client-mapper";
import { prisma } from "@/infrastructure/db/prisma";
import { formatContractNo, getNextSequenceValue } from "@/lib/sequence";

import type { CreateClientContractInput } from "@/application/dto/client-contract.schema";
import type { ClientContractItem } from "@/types/client";

type CreateClientContractParams = {
  branchId: string;
  clientId: string;
  userId: string;
  input: CreateClientContractInput;
};

type ContractResult =
  | { success: true; contract: ClientContractItem }
  | { success: false; error: string };

async function assertClientAccess(branchId: string, clientId: string) {
  return prisma.client.findFirst({
    where: { id: clientId, branchId, deletedAt: null },
    select: { id: true },
  });
}

export async function createClientContract({
  branchId,
  clientId,
  userId,
  input,
}: CreateClientContractParams): Promise<ContractResult> {
  const client = await assertClientAccess(branchId, clientId);

  if (!client) {
    return { success: false, error: "Client not found" };
  }

  const startDate = parseOptionalDate(input.startDate);
  const endDate = parseOptionalDate(input.endDate);

  if (!startDate || !endDate) {
    return { success: false, error: "Invalid contract dates" };
  }

  if (endDate < startDate) {
    return { success: false, error: "End date must be after start date" };
  }

  try {
    const contract = await prisma.$transaction(async (tx) => {
      const sequenceValue = await getNextSequenceValue(
        tx,
        branchId,
        "contract_no",
      );
      const contractNo = formatContractNo(sequenceValue);

      return tx.clientContract.create({
        data: {
          branchId,
          clientId,
          contractNo,
          title: input.title,
          startDate,
          endDate,
          status: input.status,
          fileUrl: input.fileUrl || null,
          terms: input.terms || null,
          createdBy: userId,
          updatedBy: userId,
        },
      });
    });

    return { success: true, contract: mapClientContract(contract) };
  } catch {
    return { success: false, error: "Failed to create contract" };
  }
}

type UpdateClientContractParams = {
  branchId: string;
  clientId: string;
  userId: string;
  contractId: string;
  input: Partial<CreateClientContractInput> & {
    status?: CreateClientContractInput["status"];
  };
  canTerminate: boolean;
};

export async function updateClientContract({
  branchId,
  clientId,
  userId,
  contractId,
  input,
  canTerminate,
}: UpdateClientContractParams): Promise<ContractResult> {
  const client = await assertClientAccess(branchId, clientId);

  if (!client) {
    return { success: false, error: "Client not found" };
  }

  if (input.status === "TERMINATED" && !canTerminate) {
    return { success: false, error: "Forbidden" };
  }

  const existing = await prisma.clientContract.findFirst({
    where: { id: contractId, clientId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Contract not found" };
  }

  const startDate =
    input.startDate !== undefined
      ? parseOptionalDate(input.startDate)
      : existing.startDate;
  const endDate =
    input.endDate !== undefined
      ? parseOptionalDate(input.endDate)
      : existing.endDate;

  if (!startDate || !endDate) {
    return { success: false, error: "Invalid contract dates" };
  }

  if (endDate < startDate) {
    return { success: false, error: "End date must be after start date" };
  }

  const contract = await prisma.clientContract.update({
    where: { id: contractId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      startDate,
      endDate,
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.fileUrl !== undefined
        ? { fileUrl: input.fileUrl || null }
        : {}),
      ...(input.terms !== undefined ? { terms: input.terms || null } : {}),
      updatedBy: userId,
    },
  });

  return { success: true, contract: mapClientContract(contract) };
}

export async function listClientContracts(
  branchId: string,
  clientId: string,
): Promise<ClientContractItem[]> {
  const client = await assertClientAccess(branchId, clientId);

  if (!client) {
    return [];
  }

  const contracts = await prisma.clientContract.findMany({
    where: { clientId, deletedAt: null },
    orderBy: [{ endDate: "desc" }],
  });

  return contracts.map(mapClientContract);
}

export async function attachContractFile({
  branchId,
  clientId,
  contractId,
  userId,
  fileUrl,
}: {
  branchId: string;
  clientId: string;
  contractId: string;
  userId: string;
  fileUrl: string;
}): Promise<ContractResult> {
  const client = await assertClientAccess(branchId, clientId);

  if (!client) {
    return { success: false, error: "Client not found" };
  }

  const existing = await prisma.clientContract.findFirst({
    where: { id: contractId, clientId, deletedAt: null },
  });

  if (!existing) {
    return { success: false, error: "Contract not found" };
  }

  const contract = await prisma.clientContract.update({
    where: { id: contractId },
    data: {
      fileUrl,
      updatedBy: userId,
    },
  });

  return { success: true, contract: mapClientContract(contract) };
}
