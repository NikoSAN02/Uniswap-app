import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Disable tree-shaking for all Uniswap packages to fix the DAI_OPTIMISM_SEPOLIA bug
    // while keeping the ESM build intact (to prevent ES6 class constructor mismatches)
    config.module.rules.push({
      test: /node_modules[\\\/]@uniswap/,
      sideEffects: true
    })

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
      };
    }
    return config;
  },
};

export default nextConfig;
