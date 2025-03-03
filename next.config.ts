import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["i.postimg.cc"],
  },
  experimental: {
    useWasmBinary: true,
    serverActions: {
      allowedOrigins: ["aitonomy-website.vercel.app"],
    },
  },
};

export default nextConfig;
