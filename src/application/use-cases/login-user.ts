import { verifyPassword } from "@/infrastructure/auth/password";
import { prisma } from "@/infrastructure/db/prisma";

import type { Role } from "@prisma/client";

export type LoginUserInput = {
  email: string;
  password: string;
};

export type LoginUserResult =
  | {
      success: true;
      user: {
        id: string;
        email: string;
        name: string;
        role: Role;
      };
    }
  | {
      success: false;
      error: string;
    };

export async function loginUser(
  input: LoginUserInput,
): Promise<LoginUserResult> {
  const user = await prisma.user.findFirst({
    where: {
      email: input.email.toLowerCase(),
      deletedAt: null,
    },
  });

  if (!user || !user.isActive) {
    return {
      success: false,
      error: "Invalid email or password",
    };
  }

  const passwordValid = await verifyPassword(input.password, user.passwordHash);

  if (!passwordValid) {
    return {
      success: false,
      error: "Invalid email or password",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}
