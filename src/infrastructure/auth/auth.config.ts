import Credentials from "next-auth/providers/credentials";

import { loginSchema } from "@/application/dto/login.schema";
import { loginUser } from "@/application/use-cases/login-user";
import { checkRateLimit } from "@/infrastructure/auth/rate-limit";

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

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: Number(process.env.SESSION_IDLE_TIMEOUT_SECONDS ?? "1800"),
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
          rememberMe: credentials?.rememberMe === "true",
        });

        if (!parsed.success) {
          return null;
        }

        const rateLimitKey = `login:${parsed.data.email.toLowerCase()}`;
        const rateLimit = checkRateLimit(
          rateLimitKey,
          5,
          15 * 60 * 1000,
          false,
        );

        if (!rateLimit.allowed) {
          throw new Error("RATE_LIMITED");
        }

        let result: Awaited<ReturnType<typeof loginUser>>;
        try {
          result = await loginUser({
            email: parsed.data.email,
            password: parsed.data.password,
          });
        } catch (error: unknown) {
          console.error("[auth] loginUser failed", error);
          throw new Error("DATABASE_UNAVAILABLE");
        }

        if (!result.success) {
          checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000, true);
          return null;
        }

        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          rememberMe: parsed.data.rememberMe,
        };
      },
    }),
  ],
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
