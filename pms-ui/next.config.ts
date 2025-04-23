import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        poll: 1000, // Poll every second
        aggregateTimeout: 300, // Wait 300ms before rebuilding after a change
      };
    }
    return config;
  },
};

export default nextConfig;
