import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    useWasmBinary: true,
    serverActions: {
      allowedOrigins: ["aitonomy-website.vercel.app"],
    },
  },
};

export default nextConfig;
