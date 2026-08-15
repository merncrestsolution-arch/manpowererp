import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { loginSchema } from "@/application/dto/login.schema";
import { loginUser } from "@/application/use-cases/login-user";
import { authConfig } from "@/infrastructure/auth/auth.config";
import { checkRateLimit } from "@/infrastructure/auth/rate-limit";
import { prisma } from "@/infrastructure/db/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
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
});
