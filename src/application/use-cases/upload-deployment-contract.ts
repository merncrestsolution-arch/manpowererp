import { mapDeploymentContract } from "@/application/mappers/deployment-mapper";
import { prisma } from "@/infrastructure/db/prisma";

import type { CreateDeploymentContractInput } from "@/application/dto/deployment-contract.schema";
import type { DeploymentContractItem } from "@/types/deployment";

type UploadDeploymentContractParams = {
  branchId: string;
  deploymentId: string;
  userId: string;
  input: CreateDeploymentContractInput;
};

type UploadDeploymentContractResult =
  | { success: true; contract: DeploymentContractItem }
  | { success: false; error: string };

export async function uploadDeploymentContract({
  branchId,
  deploymentId,
  userId,
  input,
}: UploadDeploymentContractParams): Promise<UploadDeploymentContractResult> {
  const deployment = await prisma.deployment.findFirst({
    where: { id: deploymentId, branchId, deletedAt: null },
    select: { id: true },
  });

  if (!deployment) {
    return { success: false, error: "Deployment not found" };
  }

  const signedAt = input.signedAt ? new Date(input.signedAt) : null;
  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;

  if (signedAt && Number.isNaN(signedAt.getTime())) {
    return { success: false, error: "Invalid signed date" };
  }

  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    return { success: false, error: "Invalid expiry date" };
  }

  try {
    const contract = await prisma.deploymentContract.create({
      data: {
        deploymentId,
        title: input.title,
        fileUrl: input.fileUrl,
        signedAt,
        expiresAt,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    return { success: true, contract: mapDeploymentContract(contract) };
  } catch {
    return { success: false, error: "Failed to save deployment contract" };
  }
}

export async function listDeploymentContractItems(
  branchId: string,
  deploymentId: string,
): Promise<DeploymentContractItem[]> {
  const deployment = await prisma.deployment.findFirst({
    where: { id: deploymentId, branchId, deletedAt: null },
    select: { id: true },
  });

  if (!deployment) {
    return [];
  }

  const contracts = await prisma.deploymentContract.findMany({
    where: { deploymentId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return contracts.map(mapDeploymentContract);
}

export async function attachDeploymentContractFile({
  branchId,
  deploymentId,
  userId,
  fileUrl,
  title,
}: {
  branchId: string;
  deploymentId: string;
  userId: string;
  fileUrl: string;
  title: string;
}) {
  return uploadDeploymentContract({
    branchId,
    deploymentId,
    userId,
    input: { title, fileUrl },
  });
}
