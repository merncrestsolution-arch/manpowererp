import type { Role } from "@prisma/client";

export type { Role };

export type SessionUser = {
  userId: string;
  email: string;
  name: string;
  role: Role;
};
