import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@heroui/react'],
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
};

export default nextConfig;
