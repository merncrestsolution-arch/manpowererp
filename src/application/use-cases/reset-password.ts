import { hashPassword, verifyToken } from "@/infrastructure/auth/password";
import { prisma } from "@/infrastructure/db/prisma";

export type ResetPasswordInput = {
  token: string;
  password: string;
};

export type ResetPasswordResult =
  { success: true } | { success: false; error: string };

export async function resetPassword(
  input: ResetPasswordInput,
): Promise<ResetPasswordResult> {
  const activeTokens = await prisma.passwordResetToken.findMany({
    where: {
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const matchedToken = (
    await Promise.all(
      activeTokens.map(async (entry) => ({
        entry,
        valid: await verifyToken(input.token, entry.token),
      })),
    )
  ).find((item) => item.valid)?.entry;

  if (!matchedToken) {
    return {
      success: false,
      error: "This reset link is invalid or has expired",
    };
  }

  if (!matchedToken.user.isActive || matchedToken.user.deletedAt) {
    return {
      success: false,
      error: "This reset link is invalid or has expired",
    };
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: matchedToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: matchedToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.updateMany({
      where: {
        userId: matchedToken.userId,
        usedAt: null,
        id: { not: matchedToken.id },
      },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true };
}
