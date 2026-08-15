import type { Role } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";

function getSessionMaxAge(rememberMe: boolean): number {
  const idleTimeoutSeconds = Number(
    process.env.SESSION_IDLE_TIMEOUT_SECONDS ?? "1800",
  );
  const rememberMeSeconds = Number(
    process.env.SESSION_REMEMBER_ME_SECONDS ?? "2592000",
  );

  return rememberMe ? rememberMeSeconds : idleTimeoutSeconds;
}

/**
 * Edge-safe Auth.js config. Keep Prisma and Node APIs out of this file
 * so Vercel middleware can run on the Edge runtime.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: Number(process.env.SESSION_IDLE_TIMEOUT_SECONDS ?? "1800"),
  },
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.userId = user.id;
        token.role = user.role as Role;
        token.rememberMe = Boolean(user.rememberMe);

        const maxAge = getSessionMaxAge(Boolean(user.rememberMe));
        token.exp = Math.floor(Date.now() / 1000) + maxAge;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as Role;
      }

      return session;
    },
  },
  trustHost: true,
};
