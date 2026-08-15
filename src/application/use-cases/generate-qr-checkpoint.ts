import { toDataURL } from "qrcode";

import { prisma } from "@/infrastructure/db/prisma";
import { createSignedCheckpointToken } from "@/lib/qr-token";

import type { GenerateQrCheckpointInput } from "@/application/dto/attendance.schema";
import type { QrCheckpointItem } from "@/types/attendance";

type GenerateQrCheckpointParams = {
  branchId: string;
  userId: string;
  input: GenerateQrCheckpointInput;
};

type GenerateQrCheckpointResult =
  | { success: true; checkpoint: QrCheckpointItem }
  | { success: false; error: string };

export async function generateQrCheckpoint({
  branchId,
  userId,
  input,
}: GenerateQrCheckpointParams): Promise<GenerateQrCheckpointResult> {
  const workLocation = await prisma.workLocation.findFirst({
    where: {
      id: input.workLocationId,
      deletedAt: null,
      status: "ACTIVE",
      client: { branchId, deletedAt: null },
    },
    include: {
      client: { select: { companyName: true } },
    },
  });

  if (!workLocation) {
    return { success: false, error: "Work location not found" };
  }

  const expiresAt = input.expiresInHours
    ? new Date(Date.now() + input.expiresInHours * 60 * 60 * 1000)
    : null;

  const checkpoint = await prisma.qrCheckpoint.create({
    data: {
      workLocationId: workLocation.id,
      code: "pending",
      isActive: true,
      expiresAt,
      createdBy: userId,
      updatedBy: userId,
    },
  });

  const signedCode = createSignedCheckpointToken(
    checkpoint.id,
    workLocation.id,
    expiresAt,
  );

  const updated = await prisma.qrCheckpoint.update({
    where: { id: checkpoint.id },
    data: { code: signedCode, updatedBy: userId },
  });

  const qrDataUrl = await toDataURL(signedCode, {
    width: 280,
    margin: 2,
  });

  return {
    success: true,
    checkpoint: {
      id: updated.id,
      workLocationId: workLocation.id,
      workLocationName: workLocation.name,
      clientName: workLocation.client.companyName,
      code: signedCode,
      isActive: updated.isActive,
      expiresAt: updated.expiresAt?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
      qrDataUrl,
    },
  };
}

export async function listQrCheckpoints(branchId: string) {
  const checkpoints = await prisma.qrCheckpoint.findMany({
    where: {
      workLocation: {
        deletedAt: null,
        client: { branchId, deletedAt: null },
      },
    },
    include: {
      workLocation: {
        select: {
          name: true,
          client: { select: { companyName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return Promise.all(
    checkpoints.map(async (checkpoint) => ({
      id: checkpoint.id,
      workLocationId: checkpoint.workLocationId,
      workLocationName: checkpoint.workLocation.name,
      clientName: checkpoint.workLocation.client.companyName,
      code: checkpoint.code,
      isActive: checkpoint.isActive,
      expiresAt: checkpoint.expiresAt?.toISOString() ?? null,
      createdAt: checkpoint.createdAt.toISOString(),
      qrDataUrl: checkpoint.isActive
        ? await toDataURL(checkpoint.code, { width: 280, margin: 2 })
        : null,
    })),
  );
}
