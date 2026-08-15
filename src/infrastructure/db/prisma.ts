import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function ensureDatabaseUrl() {
  if (process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    process.env.DIRECT_URL = process.env.DATABASE_URL;
  }

  if (process.env.DATABASE_URL) {
    return;
  }

  // Prisma throws at import time if DATABASE_URL is unset. Next.js compiles
  // this module during `next build`, so provide a dummy value for compile only.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    process.env.DATABASE_URL =
      "postgresql://build:build@127.0.0.1:5432/build?schema=public";
    process.env.DIRECT_URL ??= process.env.DATABASE_URL;
  }
}

ensureDatabaseUrl();

if (!process.env.AUTH_URL && process.env.VERCEL_URL) {
  process.env.AUTH_URL = `https://${process.env.VERCEL_URL}`;
  process.env.NEXTAUTH_URL ??= process.env.AUTH_URL;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
