import type { NextConfig } from "next";

const isVercel = Boolean(process.env.VERCEL);

const nextConfig: NextConfig = {
  // Standalone output is for Docker / Lightsail. Vercel uses its own bundling.
  ...(isVercel ? {} : { output: "standalone" as const }),
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
