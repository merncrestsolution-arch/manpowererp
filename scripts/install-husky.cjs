if (process.env.VERCEL || process.env.CI) {
  process.exit(0);
}

const { spawnSync } = require("node:child_process");

const result = spawnSync("npx", ["husky"], {
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 0);
