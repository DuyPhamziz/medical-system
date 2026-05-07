import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  // Giữ webpack cache filesystem nhưng tăng generations để tránh re-compile liên tục
  webpack: (config) => {
    config.cache = {
      type: 'filesystem',
      maxMemoryGenerations: 8,
      compression: 'gzip',
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: "/auth/login",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/auth/register",
        destination: "/register",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
