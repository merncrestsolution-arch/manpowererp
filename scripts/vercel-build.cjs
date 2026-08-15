/**
 * Vercel build: generate Prisma client, apply migrations, seed logins, then Next.js build.
 */
const { execSync } = require("node:child_process");
const {
  applyDatabaseEnv,
  hasRealDatabaseUrl,
} = require("./apply-database-env.cjs");

applyDatabaseEnv();

function run(command) {
  execSync(command, { stdio: "inherit", env: process.env });
}

run("npx prisma generate");

if (hasRealDatabaseUrl()) {
  run("npx prisma migrate deploy");
  run("node scripts/bootstrap-production.cjs");
} else {
  console.warn(
    "[vercel-build] DATABASE_URL is not set — skipping migrate/bootstrap.",
  );
}

run("npx next build");
