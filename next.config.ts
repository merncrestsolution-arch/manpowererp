import type { NextConfig } from "next";

export const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
