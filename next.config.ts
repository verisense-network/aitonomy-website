import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    useWasmBinary: true,
    // esmExternals: true,
  }
};

export default nextConfig;
