import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    useWasmBinary: true,
  },
  transpilePackages: ["jayson"],
};

export default nextConfig;
