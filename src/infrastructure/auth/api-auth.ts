import { auth } from "@/infrastructure/auth/auth";
import { resolveBranchIdForUser } from "@/lib/sequence";

import type { Role } from "@prisma/client";

export type AuthenticatedContext = {
  userId: string;
  role: Role;
  branchId: string;
};

export async function getAuthenticatedContext(): Promise<AuthenticatedContext | null> {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return null;
  }

  const branchId = await resolveBranchIdForUser(session.user.id);

  return {
    userId: session.user.id,
    role: session.user.role,
    branchId,
  };
}
