import { SignJWT, jwtVerify } from "jose";

import type { Role } from "@prisma/client";

export type MobileTokenPayload = {
  userId: string;
  email: string;
  name: string;
  role: Role;
};

function getAuthSecret(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "development-secret";

  return new TextEncoder().encode(secret);
}

function getSessionMaxAge(rememberMe: boolean): number {
  const idleTimeoutSeconds = Number(
    process.env.SESSION_IDLE_TIMEOUT_SECONDS ?? "1800",
  );
  const rememberMeSeconds = Number(
    process.env.SESSION_REMEMBER_ME_SECONDS ?? "2592000",
  );

  return rememberMe ? rememberMeSeconds : idleTimeoutSeconds;
}

export async function createMobileToken(
  payload: MobileTokenPayload,
  rememberMe: boolean,
): Promise<string> {
  const maxAge = getSessionMaxAge(rememberMe);

  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(getAuthSecret());
}

export async function verifyMobileToken(
  token: string,
): Promise<MobileTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    const userId = payload.userId;
    const email = payload.email;
    const name = payload.name;
    const role = payload.role;

    if (
      typeof userId !== "string" ||
      typeof email !== "string" ||
      typeof name !== "string" ||
      typeof role !== "string"
    ) {
      return null;
    }

    return {
      userId,
      email,
      name,
      role: role as Role,
    };
  } catch {
    return null;
  }
}

export function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim() || null;
}
