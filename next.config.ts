import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@heroui/react'],
  output: "standalone",
};

export default nextConfig;
