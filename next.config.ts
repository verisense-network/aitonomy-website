import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  images: {
    domains: ["storage.googleapis.com"],
  },
  experimental: {
    useWasmBinary: true,
    serverActions: {
      allowedOrigins: ["aitonomy.world", "aitonomy-website.vercel.app"],
    },
  },
  compiler: isProd
    ? {
        removeConsole: {
          exclude: ["error"],
        },
      }
    : undefined,
};

export default nextConfig;
