/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@xiangqi/shared-types', '@xiangqi/pikafish-wasm'],
  webpack: (config) => {
    // Pikafish Wasm binary and NNUE are loaded as static assets by the worker.
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

export default nextConfig;
