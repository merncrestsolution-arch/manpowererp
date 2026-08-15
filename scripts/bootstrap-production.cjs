/**
 * Creates the login users on an empty Supabase database.
 * Idempotent — safe to run on every Vercel deploy.
 */
const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const { applyDatabaseEnv } = require("./apply-database-env.cjs");

applyDatabaseEnv();

const prisma = new PrismaClient();

async function main() {
  const organization = await prisma.organization.upsert({
    where: { id: "seed-org-jk" },
    update: {},
    create: {
      id: "seed-org-jk",
      name: "JK Manpower",
    },
  });

  const branch = await prisma.branch.upsert({
    where: { id: "seed-branch-hq" },
    update: {},
    create: {
      id: "seed-branch-hq",
      organizationId: organization.id,
      name: "Head Office",
      code: "HQ",
    },
  });

  await prisma.shift.upsert({
    where: { id: "seed-shift-day" },
    update: {},
    create: {
      id: "seed-shift-day",
      branchId: branch.id,
      name: "Day Shift",
      startTime: "08:00",
      endTime: "17:00",
    },
  });

  const adminHash = await bcrypt.hash("Admin@12345", 12);
  const employeeHash = await bcrypt.hash("Employee@12345", 12);

  await prisma.user.upsert({
    where: { email: "admin@jkmanpower.local" },
    update: { branchId: branch.id, isActive: true },
    create: {
      email: "admin@jkmanpower.local",
      name: "Super Admin",
      passwordHash: adminHash,
      role: Role.SUPER_ADMIN,
      isActive: true,
      branchId: branch.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "employee@jkmanpower.local" },
    update: { branchId: branch.id, isActive: true },
    create: {
      email: "employee@jkmanpower.local",
      name: "Test Employee",
      passwordHash: employeeHash,
      role: Role.EMPLOYEE,
      isActive: true,
      branchId: branch.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "finance@jkmanpower.local" },
    update: { branchId: branch.id, isActive: true },
    create: {
      email: "finance@jkmanpower.local",
      name: "Finance Manager",
      passwordHash: adminHash,
      role: Role.FINANCE_MANAGER,
      isActive: true,
      branchId: branch.id,
    },
  });

  console.info("Production login users are ready.");
}

main()
  .catch((error) => {
    console.error("bootstrap-production failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
