/**
 * Map Vercel ↔ Supabase integration variables onto Prisma's names.
 * Safe to run more than once.
 */
function applyDatabaseEnv() {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL =
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL ||
      "";
  }

  if (!process.env.DIRECT_URL) {
    process.env.DIRECT_URL =
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.DATABASE_URL ||
      "";
  }

  if (!process.env.SUPABASE_URL) {
    process.env.SUPABASE_URL =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  }
}

function hasRealDatabaseUrl() {
  const url = process.env.DATABASE_URL || "";
  if (!url) return false;
  if (url.includes("build:build@127.0.0.1")) return false;
  return true;
}

module.exports = { applyDatabaseEnv, hasRealDatabaseUrl };
