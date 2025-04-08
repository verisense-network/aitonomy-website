import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["storage.googleapis.com"],
  },
  experimental: {
    useWasmBinary: true,
    serverActions: {
      allowedOrigins: ["aitonomy-website.vercel.app"],
    },
  },
};

export default nextConfig;
