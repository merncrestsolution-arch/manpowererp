import { createHmac, timingSafeEqual } from "crypto";

function getQrSigningSecret(): string {
  return (
    process.env.ATTENDANCE_QR_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "dev-attendance-qr-secret"
  );
}

function signPayload(payload: string): string {
  return createHmac("sha256", getQrSigningSecret())
    .update(payload)
    .digest("base64url");
}

export function createSignedCheckpointToken(
  checkpointId: string,
  workLocationId: string,
  expiresAt: Date | null,
): string {
  const expiry = expiresAt ? expiresAt.getTime().toString() : "0";
  const payload = `${checkpointId}.${workLocationId}.${expiry}`;
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function verifySignedCheckpointToken(token: string): {
  checkpointId: string;
  workLocationId: string;
  expiresAt: Date | null;
} | null {
  const parts = token.split(".");

  if (parts.length !== 4) {
    return null;
  }

  const [checkpointId, workLocationId, expiryRaw, signature] = parts;
  const payload = `${checkpointId}.${workLocationId}.${expiryRaw}`;
  const expectedSignature = signPayload(payload);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  const expiryMs = Number(expiryRaw);

  return {
    checkpointId,
    workLocationId,
    expiresAt: expiryMs > 0 ? new Date(expiryMs) : null,
  };
}
