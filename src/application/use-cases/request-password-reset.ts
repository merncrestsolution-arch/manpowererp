import { randomBytes } from "crypto";

import { hashToken } from "@/infrastructure/auth/password";
import { prisma } from "@/infrastructure/db/prisma";
import { sendEmail } from "@/infrastructure/external/email";

const RESET_TOKEN_TTL_MINUTES = 30;

export type RequestPasswordResetInput = {
  email: string;
  baseUrl: string;
};

export type RequestPasswordResetResult = {
  message: string;
};

export async function requestPasswordReset(
  input: RequestPasswordResetInput,
): Promise<RequestPasswordResetResult> {
  const user = await prisma.user.findFirst({
    where: {
      email: input.email.toLowerCase(),
      deletedAt: null,
      isActive: true,
    },
  });

  if (!user) {
    return {
      message:
        "If an account exists for this email, a reset link has been sent.",
    };
  }

  const rawToken = randomBytes(32).toString("hex");
  const hashedToken = await hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: hashedToken,
      expiresAt,
    },
  });

  const resetUrl = `${input.baseUrl}/reset-password/${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: "JK Manpower ERP — Reset your password",
    text: `Reset your password using this link (expires in ${RESET_TOKEN_TTL_MINUTES} minutes): ${resetUrl}`,
    html: `<p>Reset your password using this link (expires in ${RESET_TOKEN_TTL_MINUTES} minutes):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Powered by JK Manpower ERP</p>`,
  });

  return {
    message: "If an account exists for this email, a reset link has been sent.",
  };
}
