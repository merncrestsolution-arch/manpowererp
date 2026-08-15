import { prisma } from "@/infrastructure/db/prisma";
import { verifySignedCheckpointToken } from "@/lib/qr-token";

type ValidateQrResult =
  | {
      success: true;
      checkpointId: string;
      workLocationId: string;
      workLocationName: string;
      clientBranchId: string;
    }
  | { success: false; error: string };

export async function validateQrCheckin(
  branchId: string,
  qrCode: string,
): Promise<ValidateQrResult> {
  const parsed = verifySignedCheckpointToken(qrCode);

  if (!parsed) {
    return { success: false, error: "Invalid QR checkpoint code" };
  }

  const checkpoint = await prisma.qrCheckpoint.findFirst({
    where: {
      id: parsed.checkpointId,
      code: qrCode,
      workLocationId: parsed.workLocationId,
      isActive: true,
    },
    include: {
      workLocation: {
        select: {
          id: true,
          name: true,
          status: true,
          deletedAt: true,
          client: { select: { branchId: true, deletedAt: true } },
        },
      },
    },
  });

  if (!checkpoint) {
    return { success: false, error: "QR checkpoint not found or inactive" };
  }

  if (
    checkpoint.workLocation.deletedAt ||
    checkpoint.workLocation.status !== "ACTIVE" ||
    checkpoint.workLocation.client.deletedAt
  ) {
    return { success: false, error: "Work location is not available" };
  }

  if (checkpoint.workLocation.client.branchId !== branchId) {
    return {
      success: false,
      error: "QR checkpoint is not valid for this branch",
    };
  }

  const expiry = checkpoint.expiresAt ?? parsed.expiresAt;

  if (expiry && expiry < new Date()) {
    return { success: false, error: "QR checkpoint has expired" };
  }

  return {
    success: true,
    checkpointId: checkpoint.id,
    workLocationId: checkpoint.workLocationId,
    workLocationName: checkpoint.workLocation.name,
    clientBranchId: checkpoint.workLocation.client.branchId,
  };
}
